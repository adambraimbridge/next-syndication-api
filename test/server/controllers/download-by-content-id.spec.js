'use strict';

const { EventEmitter } = require('events');
const fs = require('fs');
const path = require('path');
const { Writable: WritableStream } = require('stream');

const { expect } = require('chai');
const nock = require('nock');
const proxyquire = require('proxyquire');
const sinon = require('sinon');

const {
	TEST: { FIXTURES_DIRECTORY }
} = require('config');

const MessageQueueEvent = require('../../../queue/message-queue-event');
const enrich = require('../../../server/lib/enrich');

const httpMocks = require(path.resolve(`${FIXTURES_DIRECTORY}/node-mocks-http`));

//const RE_VALID_URI = /^\/content\/([A-Za-z0-9]{8}(?:-[A-Za-z0-9]{4}){3}-[A-Za-z0-9]{12})$/;

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe(MODULE_ID, function () {
	let underTest;

	before(function() {
		sinon.stub(MessageQueueEvent.prototype, 'publish').resolves(true);
	});

	after(function() {
		MessageQueueEvent.prototype.publish.restore();
	});

	describe('download article', function () {
		const CONTENT_ID = '42ad255a-99f9-11e7-b83c-9588e51488a0';
		let getContentStub = sinon.stub();
		let req;
		let res;

		before(function () {
			underTest = proxyquire('../../../server/controllers/download-by-content-id', {
				'../lib/get-content-by-id': getContentStub.resolves(enrich(require(path.resolve(`${FIXTURES_DIRECTORY}/content/${CONTENT_ID}.json`))))
			});

			req = httpMocks.createRequest({
				'eventEmitter': EventEmitter,
				'connection': new EventEmitter(),
				'headers': {
					'ft-real-url': `https://www.ft.com/syndication/download/${CONTENT_ID}?format%3Ddocx`,
					'ft-real-path': `/syndication/download/${CONTENT_ID}?format%3Ddocx`,
					'ft-vanity-url': `/syndication/download/${CONTENT_ID}?format%3Ddocx`,
					'ft-flags-next-flags': '',
					'ft-flags': '-',
					'cookie': 'FTSession;spoor-id',
					'accept-language': 'en-GB,en-US;q=0.8,en;q=0.6',
					'accept-encoding': 'gzip, deflate, sdch, br',
					'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
					'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
				},
				'cookies': {
					'FTSession': 'FTSession',
					'spoor-id': 'spoor-id'
				},
				'hostname': 'localhost',
				'method': 'GET',
				'originalUrl': `/syndication/download/${CONTENT_ID}?format%3Ddocx`,
				'params': {
					'content_id': CONTENT_ID
				},
				'path': `/syndication/download/${CONTENT_ID}`,
				'protocol': 'http',
				'query': {
					'format': 'docx'
				},
				'url': `/syndication/download/${CONTENT_ID}?format%3Ddocx`
			});

			res = httpMocks.createResponse({
				req,
				writableStream: WritableStream
			});

			res.locals = {
				contract: {
					download_formats: {
						abc: 'docx'
					}
				},
				licence: { id: 'xyz' },
				syndication_contract: {
					id: 'lmno'
				},
				user: {
					email: 'foo@bar.com',
					first_name: 'foo',
					id: 'abc',
					surname: 'bar'
				},
				userUuid: 'abc'
			}
		});

		it('should stream the download', async function () {
			await underTest(req, res, function () {
				expect(res._isEndCalled()).to.be.true;
			});
		});

	});

	describe('download video', function () {
		const CONTENT_ID = 'a1af0574-eafb-41bd-aa4f-59aa2cd084c2';
		let getContentStub = sinon.stub();
		let fileName;
		let req;
		let res;
		let responseHeaders;

		beforeEach(function () {
			underTest = proxyquire('../../../server/controllers/download-by-content-id', {
				'../lib/get-content-by-id': getContentStub.resolves(enrich(require(path.resolve(`${FIXTURES_DIRECTORY}/content/${CONTENT_ID}.json`))))
			});

			fileName = path.resolve(`${FIXTURES_DIRECTORY}/video-small.mp4`);
			responseHeaders = {
				'content-length': fs.readFileSync(fileName).length,
				'content-disposition': 'attachement; filename=video-small.mp4',
				'content-type': 'video/mp4'
			};

			nock('https://next-media-api.ft.com')
				.head('/renditions/15053217972320/1920x1080.mp4')
				.reply(200, {}, JSON.parse(JSON.stringify(responseHeaders)));

			req = httpMocks.createRequest({
				'eventEmitter': EventEmitter,
				'connection': new EventEmitter(),
				'headers': {
					'ft-real-url': `https://www.ft.com/syndication/download/${CONTENT_ID}?format%3Ddocx`,
					'ft-real-path': `/syndication/download/${CONTENT_ID}?format%3Ddocx`,
					'ft-vanity-url': `/syndication/download/${CONTENT_ID}?format%3Ddocx`,
					'ft-flags-next-flags': '',
					'ft-flags': '-',
					'cookie': 'FTSession;spoor-id',
					'accept-language': 'en-GB,en-US;q=0.8,en;q=0.6',
					'accept-encoding': 'gzip, deflate, sdch, br',
					'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
					'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
				},
				'cookies': {
					'FTSession': 'FTSession',
					'spoor-id': 'spoor-id'
				},
				'hostname': 'localhost',
				'method': 'GET',
				'originalUrl': `/syndication/download/${CONTENT_ID}?format%3Ddocx`,
				'params': {
					'content_id': CONTENT_ID
				},
				'path': `/syndication/download/${CONTENT_ID}`,
				'protocol': 'http',
				'query': {
					'format': 'docx'
				},
				'url': `/syndication/download/${CONTENT_ID}?format%3Ddocx`
			});

			res = httpMocks.createResponse({
				req,
				writableStream: WritableStream
			});

			res.locals = {
				contract: {
					download_formats: {
						abc: 'docx'
					}
				},
				licence: { id: 'xyz' },
				syndication_contract: {
					id: 'lmno'
				},
				user: {
					email: 'foo@bar.com',
					first_name: 'foo',
					id: 'abc',
					surname: 'bar'
				},
				userUuid: 'abc'
			}
		});

		it('should stream the download', async function () {
			nock('https://next-media-api.ft.com')
				.get('/renditions/15053217972320/1920x1080.mp4')
				.delay(250)
				.reply(() => {
					return [
						res.locals.download.cancelled === true ? 400 : 200,
						fs.createReadStream(fileName),
						JSON.parse(JSON.stringify(responseHeaders))
					];
				});

			await underTest(req, res, function () {
				expect(res._isEndCalled()).to.be.true;
			});
		});

		it.skip('can be interrupted', async function () {
			nock('https://next-media-api.ft.com')
				.get('/renditions/15053217972320/1920x1080.mp4')
				.reply(() => {
					setTimeout(() =>
						req.emit('abort', req), 50);

					return [
						res.locals.download.cancelled === true ? 400 : 200,
						fs.createReadStream(fileName),
						JSON.parse(JSON.stringify(responseHeaders))
					];
				});

			await underTest(req, res, function () {
				expect(res.locals.download).to.have.property('cancelled').and.be.true;
			});
		});
	});
});
