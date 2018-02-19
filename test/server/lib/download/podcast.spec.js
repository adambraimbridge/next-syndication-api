'use strict';

const { EventEmitter } = require('events');
const fs = require('fs');
const path = require('path');
const { Writable: WritableStream } = require('stream');
const url = require('url');

const { expect } = require('chai');
const nock = require('nock');
const sinon = require('sinon');

const moment = require('moment');
const decompress = require('decompress');
const { mkdir, rm } = require('shelljs');

const {
	DOWNLOAD_ARCHIVE_EXTENSION,
	TEST: {
		FIXTURES_DIRECTORY,
		TEMP_FILES_DIRECTORY
	}
} = require('config');

const MessageQueueEvent = require('../../../../queue/message-queue-event');
const enrich = require('../../../../server/lib/enrich');
const sleep = require('../../../../server/helpers/sleep');
const underTest = require('../../../../server/lib/download/podcast');

const httpMocks = require(path.resolve(`${FIXTURES_DIRECTORY}/node-mocks-http`));

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

mkdir('-p', path.resolve(TEMP_FILES_DIRECTORY));

describe(MODULE_ID, function () {
	const DEFAULT_FORMAT = 'docx';
	const CONTRACT = require(path.resolve(`${FIXTURES_DIRECTORY}/contractResponse.json`));
	const LICENCE = { id: 'xyz' };
	const USER = require(path.resolve(`${FIXTURES_DIRECTORY}/userResponse.json`));

	before(function() {
		sinon.stub(MessageQueueEvent.prototype, 'publish').resolves(true);
	});

	after(function() {
		MessageQueueEvent.prototype.publish.restore();

		rm('-rf', path.resolve(TEMP_FILES_DIRECTORY));
	});

	const CONTENT_ID = '98b46b5f-17d3-40c2-8eaa-082df70c5f01';

	const content = enrich(require(path.resolve(`${FIXTURES_DIRECTORY}/content/${CONTENT_ID}.json`)), DEFAULT_FORMAT);

	const className = `${content.type.charAt(0).toUpperCase()}${content.type.substring(1)}Download`;

	let event;
	let extractDir;
	let extractedFiles;
	let filename;
	let now;
	let req;
	let res;

	describe(`${className}`, function() {
		beforeEach(function () {
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
					'cookie': 'FTSession;spoor-id;FT_User=USERID=1234567890',
					'accept-language': 'en-GB,en-US;q=0.8,en;q=0.6',
					'accept-encoding': 'gzip, deflate, sdch, br',
					'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
					'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
				},
				'cookies': {
					'FTSession': 'FTSession',
					'FT_User': 'USERID=1234567890',
					'spoor-id': 'spoor-id'
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
				FT_User: {
					USERID: '1234567890'
				},
				contract: CONTRACT,
				licence: LICENCE,
				syndication_contract: {
					id: 'lmno'
				},
				user: USER,
				userUuid: 'abc'
			};

			event = new MessageQueueEvent({
				event: {
					content_id: content.id,
					content_type: content.content_type,
					content_url: content.webUrl,
					contract_id: CONTRACT.contract_id,
					download_format: content.extension,
					licence_id: LICENCE.id,
					published_date: content.firstPublishedDate || content.publishedDate,
					state: 'started',
					syndication_state: String(content.canBeSyndicated),
					time: moment().toDate(),
					title: content.title,
					tracking: {
						cookie: req.headers.cookie,
						ip_address: req.ip,
						referrer: req.get('referrer'),
						session: req.cookies.FTSession,
						spoor_id: req.cookies['spoor-id'],
						url: req.originalUrl,
						user_agent: req.get('user-agent')
					},
					user: {
						email: USER.email,
						first_name: USER.first_name,
						id: USER.user_id,
						surname: USER.surname
					}
				}
			});

			let uri = url.parse(content.download.url);

			nock(`${uri.protocol}//${uri.host}`)
				.head(uri.pathname)
				.reply(200, {}, {
					'content-length': fs.readFileSync(path.resolve(`${FIXTURES_DIRECTORY}/podcast.m4a`)).length
				});

			nock(`${uri.protocol}//${uri.host}`)
				.get(uri.pathname)
				.reply(200, () => fs.createReadStream(path.resolve(`${FIXTURES_DIRECTORY}/podcast.m4a`)), {});

		});

		after(function () {
			rm('-f', filename);
			rm('-rf', extractDir);
		});

		it('initialises the download and publishes the start event', async function() {
			const dl = new underTest({
				content,
				contract: CONTRACT,
				licence: LICENCE,
				event,
				req,
				user: USER
			});

			await sleep(100);

			expect(dl.event.publish).to.have.been.called;
		});

		it('#downloadAsArchive', async function() {
			const dl = new underTest({
				content,
				contract: CONTRACT,
				licence: LICENCE,
				event,
				req,
				user: USER
			});

			expect(dl.downloadAsArchive).to.be.true;
		});

		it('#cloneRequestHeaders', async function() {
			const dl = new underTest({
				content,
				contract: CONTRACT,
				licence: LICENCE,
				event,
				req,
				user: USER
			});

			expect(dl.cloneRequestHeaders()).to.eql({
				'ft-real-url': `https://www.ft.com/syndication/download/${CONTENT_ID}?format=docx`,
				'ft-real-path': `/syndication/download/${CONTENT_ID}?format=docx`,
				'ft-vanity-url': `/syndication/download/${CONTENT_ID}?format=docx`,
				'ft-flags-next-flags': '',
				'cookie': 'FTSession;spoor-id;FT_User=USERID=1234567890',
				'accept-language': 'en-GB,en-US;q=0.8,en;q=0.6',
				'accept-encoding': 'gzip, deflate, sdch, br',
				'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
			});
		});

		describe('#appendArticle', function() {
			let dl;

			before(async function() {
				dl = new underTest({
					content,
					contract: CONTRACT,
					licence: LICENCE,
					event,
					req,
					user: USER
				});

				await dl.appendArticle();

				await sleep(100);
			});

			it('#articleAppended', async function() {
				expect(dl.articleAppended).to.be.true;
			});

			it('should have one entry', async function() {
				expect(dl._entries.length).to.equal(1)
			});

			it(`article entry's name should be: ${content.fileName}.${content.transcriptExtension}`, async function() {
				const [article] = dl._entries;

				expect(article.name).to.equals(`${content.fileName}.${content.transcriptExtension}`);
			});

			it('article entry\'s source should be a buffer', async function() {
				const [article] = dl._entries;

				expect(article.sourceType).to.equal('buffer');
			});
		});

		describe('#appendCaptions', function() {
			let dl;

			before(async function() {
				dl = new underTest({
					content,
					contract: CONTRACT,
					licence: LICENCE,
					event,
					req,
					user: USER
				});

				await dl.appendCaptions();

				await sleep(100);
			});

			it('#captionsAppended', async function() {
				expect(dl.captionsAppended).to.be.true;
			});

			it('should have no entries', async function() {
				expect(dl._entries.length).to.equal(0)
			});
		});

		describe('#appendMedia', function() {
			let dl;

			before(async function() {
				dl = new underTest({
					content,
					contract: CONTRACT,
					licence: LICENCE,
					event,
					req,
					user: USER
				});

				await dl.appendMedia();

				await sleep(100);
			});

			it('#mediaAppended', async function() {
				expect(dl.mediaAppended).to.be.true;
			});

			it('should have one entry', async function() {
				expect(dl._entries.length).to.equal(1)
			});

			it(`media entry's name should be: ${content.fileName}.${content.download.extension}`, async function() {
				const [media] = dl._entries;

				expect(media.name).to.equals(`${content.fileName}.${content.download.extension}`);
			});

			it('media entry\'s source should be a stream', async function() {
				const [media] = dl._entries;

				expect(media.sourceType).to.equal('stream');
			});
		});

		describe('#appendAll', function() {
			let dl;

			before(async function() {
				dl = new underTest({
					content,
					contract: CONTRACT,
					licence: LICENCE,
					event,
					req,
					user: USER
				});

				await dl.appendAll();

				await sleep(100);
			});

			it('#articleAppended', async function() {
				expect(dl.articleAppended).to.be.true;
			});

			it('#captionsAppended', async function() {
				expect(dl.captionsAppended).to.be.true;
			});

			it('#mediaAppended', async function() {
				expect(dl.mediaAppended).to.be.true;
			});

			it('#mediaAppended', async function() {
				expect(dl.mediaAppended).to.be.true;
			});

			it('should have two entries', async function() {
				expect(dl._entries.length).to.equal(2)
			});

			it(`article entry's name should be: ${content.fileName}.${content.transcriptExtension}`, async function() {
				const article = dl._entries.find(item => item.name.endsWith(content.transcriptExtension));

				expect(article.name).to.equals(`${content.fileName}.${content.transcriptExtension}`);
			});

			it('article entry\'s source should be a buffer', async function() {
				const article = dl._entries.find(item => item.name.endsWith(content.transcriptExtension));

				expect(article.sourceType).to.equal('buffer');
			});

			it(`media entry's name should be: ${content.fileName}.${content.download.extension}`, async function() {
				const media = dl._entries.find(item => item.name.endsWith(content.download.extension));

				expect(media.name).to.equals(`${content.fileName}.${content.download.extension}`);
			});

			it('media entry\'s source should be a stream', async function() {
				const media = dl._entries.find(item => item.name.endsWith(content.download.extension));

				expect(media.sourceType).to.equal('stream');
			});
		});

		describe('extracting archive', function() {
			let dl;
			let article;
			let media;

			before(function(done) {
				dl = new underTest({
					content,
					contract: CONTRACT,
					licence: LICENCE,
					event,
					req,
					user: USER
				});

				dl.on('end', async () => {
					extractedFiles = await decompress(filename, extractDir);

					article = extractedFiles.find(item => item.path.endsWith(content.transcriptExtension));
					media = extractedFiles.find(item => item.path.endsWith(content.download.extension));

					done();
				});

				dl.pipe(fs.createWriteStream(filename));

				dl.appendAll().then(() => {});
			});

			it('article', function() {
				expect(article.data.equals(fs.readFileSync(path.resolve(`${FIXTURES_DIRECTORY}/article.${content.transcriptExtension}`)))).to.be.true;
			});

			it('media', function() {
				expect(media.data.equals(fs.readFileSync(path.resolve(`${FIXTURES_DIRECTORY}/podcast.m4a`)))).to.be.true;
			});
		});
	});
});
