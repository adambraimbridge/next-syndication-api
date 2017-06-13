'use strict';

const { EventEmitter } = require('events');
const fs = require('fs');
const path = require('path');

const { expect } = require('chai');
const nock = require('nock');
const httpMocks = require('node-mocks-http');

const underTest = require('../../../server/controllers/download');

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe(MODULE_ID, function () {
	describe('download article', function () {
		let req;
		let res;

		before(function () {
			let fileName = path.resolve('./test/fixtures/article.docx');

			let responseHeaders = {
				'content-length': fs.readFileSync(fileName).length,
				'content-disposition': 'attachement; filename=google_deploys_ai_for_go_tournament_in_china_charm_offensive.docx',
				'content-type': 'text/docx'
			};

			nock('https://ft-rss.herokuapp.com')
				.head('/content/b59dff10-3f7e-11e7-9d56-25f963e998b2?format=docx&download=true')
				.reply(200, {}, JSON.parse(JSON.stringify(responseHeaders)));

			nock('https://ft-rss.herokuapp.com')
				.get('/content/b59dff10-3f7e-11e7-9d56-25f963e998b2?format=docx&download=true')
				.reply(200, () => {
					return fs.createReadStream(fileName);
				}, JSON.parse(JSON.stringify(responseHeaders)));

			req = httpMocks.createRequest({
				'eventEmitter': EventEmitter,
				'connection': new EventEmitter(),
				'headers': {
					'ft-real-url': 'https://www.ft.com/syndication/download?uri=https%3A%2F%2Fft-rss.herokuapp.com%2Fcontent%2Fb59dff10-3f7e-11e7-9d56-25f963e998b2%3Fformat%3Ddocx%26download%3Dtrue',
					'ft-real-path': '/syndication/download?uri=https%3A%2F%2Fft-rss.herokuapp.com%2Fcontent%2Fb59dff10-3f7e-11e7-9d56-25f963e998b2%3Fformat%3Ddocx%26download%3Dtrue',
					'ft-vanity-url': '/syndication/download?uri=https%3A%2F%2Fft-rss.herokuapp.com%2Fcontent%2Fb59dff10-3f7e-11e7-9d56-25f963e998b2%3Fformat%3Ddocx%26download%3Dtrue',
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
				'originalUrl': '/syndication/download?uri=https%3A%2F%2Fft-rss.herokuapp.com%2Fcontent%2Fb59dff10-3f7e-11e7-9d56-25f963e998b2%3Fformat%3Ddocx%26download%3Dtrue',
				'params': {},
				'path': '/syndication/download',
				'protocol': 'http',
				'query': {
					'uri': 'https://ft-rss.herokuapp.com/content/b59dff10-3f7e-11e7-9d56-25f963e998b2?format=docx&download=true'
				},
				'url': '/syndication/download?uri=https%3A%2F%2Fft-rss.herokuapp.com%2Fcontent%2Fb59dff10-3f7e-11e7-9d56-25f963e998b2%3Fformat%3Ddocx%26download%3Dtrue'
			});

			res = httpMocks.createResponse({ req });
		});

		after(function () {
			req = res = null;
		});

		it('should stream the download', function () {
			return new Promise((resolve) => {
				underTest(req, res, function () {
					expect(res._isEndCalled()).to.be.true;

					resolve();
				});
			});
		});
	});

	describe('download video', function () {
		let req;
		let res;

		beforeEach(function () {
			let fileName = path.resolve('./test/fixtures/video-small.mp4');

			let responseHeaders = {
				'content-length': fs.readFileSync(fileName).length,
				'content-disposition': 'attachement; filename=video-small.mp4',
				'content-type': 'video/mp4'
			};

			nock('https://next-media-api.ft.com')
				.head('/renditions/14955580012610/1920x1080.mp4')
				.delay(500)
				.reply(200, {}, JSON.parse(JSON.stringify(responseHeaders)));

			nock('https://next-media-api.ft.com')
				.get('/renditions/14955580012610/1920x1080.mp4')
				.delay(500)
				.reply(() => {
					return [
						req.__download_cancelled__ === true ? 400: 200,
						fs.createReadStream(path.resolve(fileName)),
						JSON.parse(JSON.stringify(responseHeaders))
					];
				});

			req = httpMocks.createRequest({
				'eventEmitter': EventEmitter,
				'connection': new EventEmitter(),
				'headers': {
					'ft-real-url': 'https://www.ft.com/syndication/download?uri=https%3A%2F%2Fnext-media-api.ft.com%2Frenditions%2F14955580012610%2F1920x1080.mp4',
					'ft-real-path': '/syndication/download?uri=https%3A%2F%2Fnext-media-api.ft.com%2Frenditions%2F14955580012610%2F1920x1080.mp4',
					'ft-vanity-url': '/syndication/download?uri=https%3A%2F%2Fnext-media-api.ft.com%2Frenditions%2F14955580012610%2F1920x1080.mp4',
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
				'originalUrl': '/syndication/download?uri=https%3A%2F%2Fnext-media-api.ft.com%2Frenditions%2F14955580012610%2F1920x1080.mp4',
				'params': {},
				'path': '/syndication/download',
				'protocol': 'http',
				'query': {
					'uri': 'https://next-media-api.ft.com/renditions/14955580012610/1920x1080.mp4'
				},
				'url': '/syndication/download?uri=https%3A%2F%2Fnext-media-api.ft.com%2Frenditions%2F14955580012610%2F1920x1080.mp4'
			});

			res = httpMocks.createResponse({ req });
		});

		afterEach(function () {
			req = res = null;
		});

		it('should stream the download', function () {
			return new Promise((resolve) => {
				underTest(req, res, function () {
					expect(res._isEndCalled()).to.be.true;

					resolve();
				});
			});
		});

		it('can be interupted', function () {
			return new Promise((resolve) => {
				underTest(req, res, function () {
					expect(req).to.have.property('__download_cancelled__').and.be.true;

					expect(res.statusCode).to.equal(400);

					resolve();
				});

				setTimeout(() =>
					req.emit('abort', req), 1000);
			});
		});
	});
});
