'use strict';

const { EventEmitter } = require('events');
const fs = require('fs');
const path = require('path');
const { Writable: WritableStream } = require('stream');

const { expect } = require('chai');
const nock = require('nock');

const {
	BASE_URI_FT_API,
	SESSION_PRODUCTS_PATH,
	SESSION_URI,
	TEST: { FIXTURES_DIRECTORY }
} = require('config');

const underTest = require('../../../server/controllers/download-by-content-id');

const httpMocks = require('../../fixtures/node-mocks-http');

const RE_VALID_URI = /^\/content\/([A-Za-z0-9]{8}(?:-[A-Za-z0-9]{4}){3}-[A-Za-z0-9]{12})$/;

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe(MODULE_ID, function () {
	describe('download article', function () {
		const CONTENT_ID = 'b59dff10-3f7e-11e7-9d56-25f963e998b2';
		let req;
		let res;

		before(function () {
			nock(SESSION_URI)
				.get(SESSION_PRODUCTS_PATH)
				.reply(200, { uuid: 'abc', products: 'Tools,S1,P0,P1,P2' }, {});

			nock(BASE_URI_FT_API)
				.get(uri => RE_VALID_URI.test(uri))
				.reply(uri => {
					return [
						200,
						require(path.resolve(`${FIXTURES_DIRECTORY}/${uri.match(RE_VALID_URI)[1]}`)),
						{}
					];
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
					'cookie': '',
					'accept-language': 'en-GB,en-US;q=0.8,en;q=0.6',
					'accept-encoding': 'gzip, deflate, sdch, br',
					'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
					'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
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
				userUuid: 'abc'
			}
		});

		it('should stream the download', function (done) {
			underTest(req, res, function () {
				expect(res._isEndCalled()).to.be.true;

				done();
			});
		});
	});

	describe('download video', function () {
		const CONTENT_ID = 'd7bf1822-ec58-4a8e-a669-5cbcc0d6a1b2';
		let fileName;
		let req;
		let res;
		let responseHeaders;

		beforeEach(function () {
			nock(SESSION_URI)
				.get(SESSION_PRODUCTS_PATH)
				.reply(200, { uuid: 'abc', products: 'Tools,S1,P0,P1,P2' }, {});

			nock(BASE_URI_FT_API)
				.get(uri => RE_VALID_URI.test(uri))
				.delay(500)
				.reply(uri => {
					return [
						200,
						require(path.resolve(`${FIXTURES_DIRECTORY}/${uri.match(RE_VALID_URI)[1]}`)),
						{}
					];
				});

			fileName = path.resolve(`${FIXTURES_DIRECTORY}/video-small.mp4`);
			responseHeaders = {
				'content-length': fs.readFileSync(fileName).length,
				'content-disposition': 'attachement; filename=video-small.mp4',
				'content-type': 'video/mp4'
			};

			nock('https://next-media-api.ft.com')
				.head('/renditions/14968298368190/1920x1080.mp4')
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
					'cookie': '',
					'accept-language': 'en-GB,en-US;q=0.8,en;q=0.6',
					'accept-encoding': 'gzip, deflate, sdch, br',
					'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
					'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
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
				userUuid: 'abc'
			}
		});

		it('should stream the download', function (done) {
			nock('https://next-media-api.ft.com')
				.get('/renditions/14968298368190/1920x1080.mp4')
				.delay(250)
				.reply(() => {
					return [
						req.__download_cancelled__ === true ? 400 : 200,
						fs.createReadStream(fileName),
						JSON.parse(JSON.stringify(responseHeaders))
					];
				});

			underTest(req, res, function () {
				expect(res._isEndCalled()).to.be.true;

				done();
			});
		});

		it('can be interrupted', function (done) {
			nock('https://next-media-api.ft.com')
				.get('/renditions/14968298368190/1920x1080.mp4')
				.reply(() => {
					setTimeout(() =>
						req.emit('abort', req), 100);

					return [
						req.__download_cancelled__ === true ? 400 : 200,
						fs.createReadStream(fileName),
						JSON.parse(JSON.stringify(responseHeaders))
					];
				});

			underTest(req, res, function () {
				expect(req).to.have.property('__download_cancelled__').and.be.true;

				done();
			});
		});
	});
});
