'use strict';

const { EventEmitter } = require('events');
const fs = require('fs');
const path = require('path');
const { Writable: WritableStream } = require('stream');
const url = require('url');

const { expect } = require('chai');
const nock = require('nock');
const sinon = require('sinon');

const decompress = require('decompress');
const { mkdir, rm } = require('shelljs');

const {
	DOWNLOAD_ARCHIVE_EXTENSION,
	TEST: {
		FIXTURES_DIRECTORY,
		TEMP_FILES_DIRECTORY
	}
} = require('config');

const MessageQueueEvent = require('../../../queue/message-queue-event');
const underTest = require('../../../server/lib/bundle-content');

const httpMocks = require(path.resolve(`${FIXTURES_DIRECTORY}/node-mocks-http`));

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

mkdir('-p', path.resolve(TEMP_FILES_DIRECTORY));

describe.skip(MODULE_ID, function () {
	before(function() {
		sinon.stub(MessageQueueEvent.prototype, 'publish').resolves(true);
	});

	after(function() {
		MessageQueueEvent.prototype.publish.restore();

		rm('-rf', path.resolve(TEMP_FILES_DIRECTORY));
	});

	describe('With a transcript and captions', function () {
		const CONTENT_ID = 'd7bf1822-ec58-4a8e-a669-5cbcc0d6a1b2';

		let extractDir;
		let extractedFiles;
		let filename;
		let file;
		let now;
		let req;
		let res;

		before(function (done) {
			now = Date.now();

			extractDir = path.resolve(`${TEMP_FILES_DIRECTORY}/temp_${now}`);

			filename = path.resolve(`${TEMP_FILES_DIRECTORY}/temp__${now}.${DOWNLOAD_ARCHIVE_EXTENSION}`);

			mkdir('-p', extractDir);

			req = httpMocks.createRequest({
				'eventEmitter': EventEmitter,
				'connection': new EventEmitter(),
				'headers': {
					'ft-real-url': `https://www.ft.com/syndication/download/${CONTENT_ID}?format=docx`,
					'ft-real-path': `/syndication/download/${CONTENT_ID}?format=docx`,
					'ft-vanity-url': `/syndication/download/${CONTENT_ID}?format=docx`,
					'ft-flags-next-flags': '',
					'ft-flags': '-',
					'cookie': '',
					'accept-language': 'en-GB,en-US;q=0.8,en;q=0.6',
					'accept-encoding': 'gzip, deflate, sdch, br',
					'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
					'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
				},
				'hostname': 'localhost',
				'method': 'GET',
				'originalUrl': `/syndication/download/${CONTENT_ID}?format=docx`,
				'params': {},
				'path': '/syndication/download',
				'protocol': 'http',
				'query': {
					'format': 'docx'
				},
				'url': `/syndication/download/${CONTENT_ID}?format=docx`
			});

			res = httpMocks.createResponse({
				req,
				writableStream: WritableStream
			});

			res.locals = {
				syndication_contract: {
					id: 'lmno'
				},
				user: {
					email: 'foo@bar.com',
					first_name: 'foo',
					user_id: 'abc',
					surname: 'bar'
				},
				userUuid: 'abc'
			};

			let content = res.__content = require(path.resolve(`${FIXTURES_DIRECTORY}/${CONTENT_ID}.json`));

			content.download = content.dataSource[content.dataSource.length - 1];
			content.extension = DOWNLOAD_ARCHIVE_EXTENSION;
			content.fileName = 'my_test_file';
			content.download.extension = 'mp4';

			res.locals.__event = new MessageQueueEvent({
				content_id: content.id,
				download_format: DOWNLOAD_ARCHIVE_EXTENSION,
				syndication_state: content.canBeSyndicated,
				time: (new Date()).toJSON(),
				user: {
					email: 'foo@bar.com',
					first_name: 'foo',
					id: 'abc',
					surname: 'bar'
				}
			});

			let uri = url.parse(content.dataSource[content.dataSource.length - 1].binaryUrl);

			nock(`${uri.protocol}//${uri.host}`)
				.head(uri.pathname)
				.reply(200, {}, {
					'content-length': fs.readFileSync(path.resolve(`${FIXTURES_DIRECTORY}/video-small.mp4`)).length
				});

			nock(`${uri.protocol}//${uri.host}`)
				.get(uri.pathname)
				.reply(200, () => fs.createReadStream(path.resolve(`${FIXTURES_DIRECTORY}/video-small.mp4`)), {});

			res.pipe(fs.createWriteStream(filename));

			underTest(req, res, () => {
				(async () => {
					file = fs.readFileSync(filename);

					extractedFiles = await decompress(filename, extractDir);

					done();
				})();
			});
		});

		after(function () {
			rm('-f', filename);
			rm('-rf', extractDir);
		});

		it(`should download the ${DOWNLOAD_ARCHIVE_EXTENSION} file`, function () {
			expect(file).to.be.an.instanceOf(Buffer);

			expect(file.length).to.be.above(0)
				.and.at.least(fs.readFileSync(path.resolve(`${FIXTURES_DIRECTORY}/video-small.mp4`)).length);
		});

		it(`extracting the ${DOWNLOAD_ARCHIVE_EXTENSION} file should contain 2 files`, function () {
			expect(extractedFiles).to.have.length(3);
		});

		it(`extracting the ${DOWNLOAD_ARCHIVE_EXTENSION} file should contain a video matching the downloaded resource`, function () {
			const downloadedFile = fs.readFileSync(path.resolve(`${FIXTURES_DIRECTORY}/video-small.mp4`));

			const videoFile = extractedFiles.find(file => path.extname(file.path) === '.mp4');

			expect(videoFile.data.equals(downloadedFile)).to.be.true;
		});

		it('the video\'s file name should match the content.fileName', function () {
			expect(extractedFiles[0].path).to.equal(`${res.__content.fileName}.${res.__content.download.extension}`);
		});

		it(`extracting the ${DOWNLOAD_ARCHIVE_EXTENSION} file should contain a transcript in docx format`, function () {
			const transcriptFile = extractedFiles.find(file => path.extname(file.path) === '.docx');

			expect(transcriptFile.data).to.be.an.instanceOf(Buffer)
				.and.to.have.length.above(0);
		});

		it('the transcript\'s file name should match the content.fileName', function () {
			const transcriptFile = extractedFiles.find(file => path.extname(file.path) === '.docx');

			expect(transcriptFile.path).to.equal(`${res.__content.fileName}.${res.__content.transcriptExtension}`);
		});
	});

	describe('Without a transcript', function () {
		const CONTENT_ID = '80d634ea-fa2b-46b5-886f-1418c6445182';

		let extractDir;
		let extractedFiles;
		let filename;
		let file;
		let now;
		let req;
		let res;

		before(function (done) {
			now = Date.now();

			extractDir = path.resolve(`${TEMP_FILES_DIRECTORY}/temp_${now}`);

			filename = path.resolve(`${TEMP_FILES_DIRECTORY}/temp__${now}.${DOWNLOAD_ARCHIVE_EXTENSION}`);

			mkdir('-p', extractDir);

			req = httpMocks.createRequest({
				'eventEmitter': EventEmitter,
				'connection': new EventEmitter(),
				'headers': {
					'ft-real-url': `https://www.ft.com/syndication/download/${CONTENT_ID}?format=docx`,
					'ft-real-path': `/syndication/download/${CONTENT_ID}?format=docx`,
					'ft-vanity-url': `/syndication/download/${CONTENT_ID}?format=docx`,
					'ft-flags-next-flags': '',
					'ft-flags': '-',
					'cookie': '',
					'accept-language': 'en-GB,en-US;q=0.8,en;q=0.6',
					'accept-encoding': 'gzip, deflate, sdch, br',
					'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
					'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
				},
				'hostname': 'localhost',
				'method': 'GET',
				'originalUrl': `/syndication/download/${CONTENT_ID}?format=docx`,
				'params': {},
				'path': '/syndication/download',
				'protocol': 'http',
				'query': {
					'format': 'docx'
				},
				'url': `/syndication/download/${CONTENT_ID}?format=docx`
			});

			res = httpMocks.createResponse({
				req,
				writableStream: WritableStream
			});

			res.locals = {
				syndication_contract: {
					id: 'lmno'
				},
				user: {
					email: 'foo@bar.com',
					first_name: 'foo',
					user_id: 'abc',
					surname: 'bar'
				},
				userUuid: 'abc'
			};

			let content = res.__content = require(path.resolve(`${FIXTURES_DIRECTORY}/${CONTENT_ID}.json`));

			content.download = content.dataSource[content.dataSource.length - 1];
			content.extension = DOWNLOAD_ARCHIVE_EXTENSION;
			content.fileName = 'my_test_file';
			content.download.extension = 'mp4';

			res.locals.__event = new MessageQueueEvent({
				content_id: content.id,
				download_format: DOWNLOAD_ARCHIVE_EXTENSION,
				syndication_state: content.canBeSyndicated,
				time: (new Date()).toJSON(),
				user: {
					email: 'foo@bar.com',
					first_name: 'foo',
					id: 'abc',
					surname: 'bar'
				}
			});

			let uri = url.parse(content.dataSource[content.dataSource.length - 1].binaryUrl);

			nock(`${uri.protocol}//${uri.host}`)
				.head(uri.pathname)
				.reply(200, {}, {
					'content-length': fs.readFileSync(path.resolve(`${FIXTURES_DIRECTORY}/video-small.mp4`)).length
				});

			nock(`${uri.protocol}//${uri.host}`)
				.get(uri.pathname)
				.reply(200, () => fs.createReadStream(path.resolve(`${FIXTURES_DIRECTORY}/video-small.mp4`)), {});

			res.pipe(fs.createWriteStream(filename));

			underTest(req, res, () => {
				(async () => {
					file = fs.readFileSync(filename);

					extractedFiles = await decompress(filename, extractDir);

					done();
				})();
			});
		});

		after(function () {
			rm('-f', filename);
			rm('-rf', extractDir);
		});

		it(`should download the ${DOWNLOAD_ARCHIVE_EXTENSION} file`, function () {
			expect(file).to.be.an.instanceOf(Buffer);

			expect(file.length).to.be.above(0)
				.and.at.most(fs.readFileSync(path.resolve(`${FIXTURES_DIRECTORY}/video-small.mp4`)).length);
		});

		it(`extracting the ${DOWNLOAD_ARCHIVE_EXTENSION} file should contain only 1 file`, function () {
			expect(extractedFiles).to.have.length(1);
		});

		it(`extracting the ${DOWNLOAD_ARCHIVE_EXTENSION} file should match the downloaded resource`, function () {
			const downloadedFile = fs.readFileSync(path.resolve(`${FIXTURES_DIRECTORY}/video-small.mp4`));

			expect(extractedFiles[0].data.equals(downloadedFile)).to.be.true;
		});

		it('the video\'s file name should match the content.fileName', function () {
			expect(extractedFiles[0].path).to.equal(`${res.__content.fileName}.${res.__content.download.extension}`);
		});
	});
});
