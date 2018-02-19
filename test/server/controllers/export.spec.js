'use strict';

const { EventEmitter } = require('events');
const path = require('path');
const { Writable: WritableStream } = require('stream');

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

const { expect } = chai;

chai.use(sinonChai);

const {
	EXPORT,
	TEST: { FIXTURES_DIRECTORY }
} = require('config');

const httpMocks = require(path.resolve(`${FIXTURES_DIRECTORY}/node-mocks-http`));

const underTest = require('../../../server/controllers/export');

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe(MODULE_ID, function () {
	const { initDB } = require(path.resolve(`${FIXTURES_DIRECTORY}/massive`))();

	const DownloadsHeaders = Object.keys(EXPORT.downloads).map(key => EXPORT.downloads[key]).join(',');
	const SavedItemsHeaders = Object.keys(EXPORT.saved_items).map(key => EXPORT.saved_items[key]).join(',');

	let req;
	let res;
	let next;

	let db;

	const downloadedItems = [{
		'_id': '095ffdbf50ee4041ee18ed9077216844',
		'contract_id': 'FTS-14029674',
		'asset_type': 'FT Article',
		'user_id': '8ef593a8-eef6-448c-8560-9ca8cdca80a5',
		'content_id': 'http://www.ft.com/thing/c7923fba-1d31-39fd-82f0-ba1822ef20d2',
		'time': '2017-08-22T13:32:49.226Z',
		'download_format': 'docx',
		'state': 'complete',
		'user_name': 'christos constandinou',
		'user_email': 'christos.constandinou@ft.com',
		'content_type': 'article',
		'title': 'The significance of the Brexit sequencing U-turn',
		'published_date': '2017-06-28T10:51:47.000Z',
		'syndication_state': 'yes',
		'last_modified': '2017-08-22T13:32:50.177Z',
		'id': 'c7923fba-1d31-39fd-82f0-ba1822ef20d2',
		'date': '22 August 2017',
		'published': '28 June 2017'
	}, {
		'_id': '6feabf0d4eed16682bfbd6d3560a45ee',
		'contract_id': 'FTS-14029674',
		'asset_type': 'FT Article',
		'user_id': 'b2697f93-52d3-4d42-8409-bdf91b09e894',
		'content_id': 'http://www.ft.com/thing/b59dff10-3f7e-11e7-9d56-25f963e998b2',
		'time': '2017-08-22T12:35:10.751Z',
		'download_format': 'plain',
		'state': 'complete',
		'user_name': 'James Wise',
		'user_email': 'james.wise@ft.com',
		'content_type': 'article',
		'title': 'Google deploys AI for Go tournament in China charm offensive',
		'published_date': '2017-05-23T08:59:01.000Z',
		'syndication_state': 'yes',
		'last_modified': '2017-08-22T12:35:11.895Z',
		'id': 'b59dff10-3f7e-11e7-9d56-25f963e998b2',
		'date': '22 August 2017',
		'published': '23 May 2017'
	}, {
		'_id': '8d1beddb5cc7ed98a61fc28934871b35',
		'contract_id': 'FTS-14029674',
		'asset_type': 'FT Article',
		'user_id': 'b2697f93-52d3-4d42-8409-bdf91b09e894',
		'content_id': 'http://www.ft.com/thing/c7923fba-1d31-39fd-82f0-ba1822ef20d2',
		'download_format': 'docx',
		'time': '2017-08-22T10:54:54.997Z',
		'state': 'complete',
		'user_name': 'James Wise',
		'user_email': 'james.wise@ft.com',
		'content_type': 'article',
		'title': 'The significance of the Brexit sequencing U-turn',
		'published_date': '2017-06-20T10:16:52.000Z',
		'syndication_state': 'yes',
		'last_modified': '2017-08-22T10:54:55.376Z',
		'id': 'c7923fba-1d31-39fd-82f0-ba1822ef20d2',
		'date': '22 August 2017',
		'published': '20 June 2017'
	}];

	const savedItems = [{
		'_id': '8d1beddb5cc7ed98a61fc28934871b35',
		'contract_id': 'FTS-14029674',
		'asset_type': 'FT Article',
		'user_id': 'b2697f93-52d3-4d42-8409-bdf91b09e894',
		'content_id': 'http://www.ft.com/thing/c7923fba-1d31-39fd-82f0-ba1822ef20d2',
		'time': '2017-08-22T10:54:54.997Z',
		'state': 'saved',
		'user_name': 'James Wise',
		'user_email': 'james.wise@ft.com',
		'content_type': 'article',
		'title': 'The significance of the Brexit sequencing U-turn',
		'published_date': '2017-06-20T10:16:52.000Z',
		'syndication_state': 'yes',
		'last_modified': '2017-08-22T10:54:55.376Z',
		'id': 'c7923fba-1d31-39fd-82f0-ba1822ef20d2',
		'date': '22 August 2017',
		'published': '20 June 2017'
	}, {
		'_id': 'ee0981e4bebd818374a6c1416029656f',
		'contract_id': 'FTS-14029674',
		'asset_type': 'FT Article',
		'user_id': 'b2697f93-52d3-4d42-8409-bdf91b09e894',
		'content_id': 'http://www.ft.com/thing/dbe4928a-5bec-11e7-b553-e2df1b0c3220',
		'time': '2017-08-22T10:48:04.022Z',
		'state': 'saved',
		'user_name': 'James Wise',
		'user_email': 'james.wise@ft.com',
		'content_type': 'article',
		'title': 'Hillsborough police commander charged with manslaughter',
		'published_date': '2017-06-28T11:21:44.000Z',
		'syndication_state': 'yes',
		'last_modified': '2017-08-22T10:48:04.301Z',
		'id': 'dbe4928a-5bec-11e7-b553-e2df1b0c3220',
		'date': '22 August 2017',
		'published': '28 June 2017'
	}];

	describe('creates a CSV file', function () {
		describe('downloads', function () {

			before(async function () {
				db = initDB(downloadedItems);

				req = httpMocks.createRequest({
					'eventEmitter': EventEmitter,
					'connection': new EventEmitter(),
					'headers': {
						'ft-real-url': 'https://www.ft.com/syndication/export?type=downloads',
						'ft-real-path': '/syndication/export?type=downloads',
						'ft-vanity-url': '/syndication/export?type=downloads',
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
					'originalUrl': '/syndication/export?type=downloads',
					'path': '/syndication/export',
					'protocol': 'http',
					'query': {
						'type': 'downloads'
					},
					'url': '/syndication/export?type=downloads'
				});

				res = httpMocks.createResponse({
					req,
					writableStream: WritableStream
				});

				res.attachment = sinon.stub();
				res.send = sinon.stub();
				res.status = sinon.stub();
				next = sinon.stub();

				res.locals = {
					$DB: db,
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
						firstName: 'foo',
						id: 'abc',
						lastName: 'bar'
					},
					userUuid: 'abc'
				};

				await underTest(req, res, next);
			});

			it('should send a buffer of the CSV', function () {
				expect(res.send).to.have.been.calledWith(Buffer.from([DownloadsHeaders].concat(downloadedItems.map(item =>
					Object.keys(EXPORT.downloads).map(key => item[key]).join(','))).join('\n'), 'utf8'));
			});

			it('should set the status to 200', function () {
				expect(res.status).to.have.been.calledWith(200);
			});

			it('should call next', function () {
				expect(next).to.have.been.called;
			});
		});

		describe('saved items', function () {

			before(async function () {
				db = initDB(savedItems);

				req = httpMocks.createRequest({
					'eventEmitter': EventEmitter,
					'connection': new EventEmitter(),
					'headers': {
						'ft-real-url': 'https://www.ft.com/syndication/export?type=saved_items',
						'ft-real-path': '/syndication/export?type=saved_items',
						'ft-vanity-url': '/syndication/export?type=saved_items',
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
					'originalUrl': '/syndication/export?type=saved_items',
					'path': '/syndication/export',
					'protocol': 'http',
					'query': {
						'type': 'saved_items'
					},
					'url': '/syndication/export?type=saved_items'
				});

				res = httpMocks.createResponse({
					req,
					writableStream: WritableStream
				});

				res.attachment = sinon.stub();
				res.send = sinon.stub();
				res.status = sinon.stub();
				next = sinon.stub();

				res.locals = {
					$DB: db,
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
						firstName: 'foo',
						id: 'abc',
						lastName: 'bar'
					},
					userUuid: 'abc'
				};

				await underTest(req, res, next);
			});

			it('should send a buffer of the CSV', function () {
				expect(res.send).to.have.been.calledWith(Buffer.from([SavedItemsHeaders].concat(savedItems.map(item =>
					Object.keys(EXPORT.saved_items).map(key => item[key]).join(','))).join('\n'), 'utf8'));
			});

			it('should set the status to 200', function () {
				expect(res.status).to.have.been.calledWith(200);
			});

			it('should call next', function () {
				expect(next).to.have.been.called;
			});
		});
	});
});
