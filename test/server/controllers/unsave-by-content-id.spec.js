'use strict';

const { EventEmitter } = require('events');
const path = require('path');
const { Writable: WritableStream } = require('stream');

const chai = require('chai');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

const {
	TEST: { FIXTURES_DIRECTORY }
} = require('config');

const httpMocks = require('../../fixtures/node-mocks-http');

const { db, client } = require('../../../db/connect');
const HistorySchema = require('../../../db/table_schemas/history');
const toPutItem = require('../../../db/toPutItem');

const { expect } = chai;
chai.use(sinonChai);

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe(MODULE_ID, function () {
	let underTest;

	describe('referrer !== /republishing/save', function () {
		const savedItem = {
			'_id': '9807a4b6dcb3ce1188593759dd6818cd',
			'content_id': 'http://www.ft.com/thing/80d634ea-fa2b-46b5-886f-1418c6445182',
			'contract_id': 'FTS-14029674',
			'contributor_content': false,
			'download_format': 'docx',
			'item_state': 'save',
			'licence_id': 'c3391af1-0d46-4ddc-a922-df7c49cf1552',
			'published_date': '2017-06-19T12:47:54.753Z',
			'syndication_state': 'verify',
			'time': '2017-07-26T12:44:26.135Z',
			'title': 'FT View: Brexit rethink required',
			'user': {
				'email': 'christos.constandinou@ft.com',
				'first_name': 'Christos',
				'id': '8ef593a8-eef6-448c-8560-9ca8cdca80a5',
				'surname': 'Constandinou'
			},
			'version': 'v1'
		};
		let next;
		let req;
		let res;

		before(async function () {
			sinon.stub(db, 'putItemAsync').resolves({});
			sinon.stub(client, 'scanAsync').resolves({
				Count: 1,
				Items: [savedItem]
			});

			underTest = proxyquire('../../../server/controllers/unsave-by-content-id', {
				'../lib/fetch-content-by-id': sinon.stub().resolves(require(path.resolve(`${FIXTURES_DIRECTORY}/80d634ea-fa2b-46b5-886f-1418c6445182.json`)))
			});

			req = httpMocks.createRequest({
				'eventEmitter': EventEmitter,
				'connection': new EventEmitter(),
				'headers': {
					'ft-real-url': 'https://www.ft.com/syndication/unsave/80d634ea-fa2b-46b5-886f-1418c6445182',
					'ft-real-path': '/syndication/unsave/80d634ea-fa2b-46b5-886f-1418c6445182',
					'ft-vanity-url': '/syndication/unsave/80d634ea-fa2b-46b5-886f-1418c6445182',
					'ft-flags-next-flags': '',
					'ft-flags': '-',
					'cookie': '',
					'accept-language': 'en-GB,en-US;q=0.8,en;q=0.6',
					'accept-encoding': 'gzip, deflate, sdch, br',
					'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
					'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
				},
				'hostname': 'localhost',
				'method': 'POST',
				'originalUrl': '/syndication/unsave/80d634ea-fa2b-46b5-886f-1418c6445182',
				'params': {
					'id': '80d634ea-fa2b-46b5-886f-1418c6445182'
				},
				'path': '/syndication/unsave/80d634ea-fa2b-46b5-886f-1418c6445182',
				'protocol': 'http',
				'body': {},
				'url': '/syndication/unsave/80d634ea-fa2b-46b5-886f-1418c6445182'
			});

			res = httpMocks.createResponse({
				req,
				writableStream: WritableStream
			});

			res.sendStatus = sinon.stub();
			res.status = sinon.stub();
			res.json = sinon.stub();

			res.locals = {
				flags: {
					syndication: true,
					syndicationNew: 'on',
					syndicationRedux: 'on'
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

			next = sinon.stub();

			await underTest(req, res, next);
		});

		after(function () {
			underTest = null;

			db.putItemAsync.restore();
			client.scanAsync.restore();
		});

		it('returns contract data', function () {
			expect(db.putItemAsync).to.have.been.calledWith(toPutItem(savedItem, HistorySchema));
		});

		it('sets the http status to 204', function () {
			expect(res.sendStatus).to.have.been.calledWith(204);
		});

		it('calls the next middleware function', function () {
			expect(next).to.have.been.called;
		});
	});

	describe('referrer === /republishing/save', function () {
		const savedItem = {
			'_id': '9807a4b6dcb3ce1188593759dd6818cd',
			'content_id': 'http://www.ft.com/thing/80d634ea-fa2b-46b5-886f-1418c6445182',
			'contract_id': 'FTS-14029674',
			'contributor_content': false,
			'download_format': 'docx',
			'item_state': 'save',
			'licence_id': 'c3391af1-0d46-4ddc-a922-df7c49cf1552',
			'published_date': '2017-06-19T12:47:54.753Z',
			'syndication_state': 'verify',
			'time': '2017-07-26T12:44:26.135Z',
			'title': 'FT View: Brexit rethink required',
			'user': {
				'email': 'christos.constandinou@ft.com',
				'first_name': 'Christos',
				'id': '8ef593a8-eef6-448c-8560-9ca8cdca80a5',
				'surname': 'Constandinou'
			},
			'version': 'v1'
		};
		let next;
		let req;
		let res;

		before(async function () {
			sinon.stub(db, 'putItemAsync').resolves({});
			sinon.stub(client, 'scanAsync').resolves({
				Count: 1,
				Items: [savedItem]
			});

			underTest = proxyquire('../../../server/controllers/unsave-by-content-id', {
				'../lib/fetch-content-by-id': sinon.stub().resolves(require(path.resolve(`${FIXTURES_DIRECTORY}/80d634ea-fa2b-46b5-886f-1418c6445182.json`)))
			});

			req = httpMocks.createRequest({
				'eventEmitter': EventEmitter,
				'connection': new EventEmitter(),
				'headers': {
					'ft-real-url': 'https://www.ft.com/syndication/unsave/80d634ea-fa2b-46b5-886f-1418c6445182',
					'ft-real-path': '/syndication/unsave/80d634ea-fa2b-46b5-886f-1418c6445182',
					'ft-vanity-url': '/syndication/unsave/80d634ea-fa2b-46b5-886f-1418c6445182',
					'ft-flags-next-flags': '',
					'ft-flags': '-',
					'cookie': '',
					'accept-language': 'en-GB,en-US;q=0.8,en;q=0.6',
					'accept-encoding': 'gzip, deflate, sdch, br',
					'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
					'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
					'referrer': 'https://www.ft.com/republishing/save'
				},
				'hostname': 'localhost',
				'method': 'POST',
				'originalUrl': '/syndication/unsave/80d634ea-fa2b-46b5-886f-1418c6445182',
				'params': {
					'id': '80d634ea-fa2b-46b5-886f-1418c6445182'
				},
				'path': '/syndication/unsave/80d634ea-fa2b-46b5-886f-1418c6445182',
				'protocol': 'http',
				'body': {},
				'url': '/syndication/unsave/80d634ea-fa2b-46b5-886f-1418c6445182'
			});

			res = httpMocks.createResponse({
				req,
				writableStream: WritableStream
			});

			res.redirect = sinon.stub();
			res.sendStatus = sinon.stub();
			res.status = sinon.stub();
			res.json = sinon.stub();

			res.locals = {
				flags: {
					syndication: true,
					syndicationNew: 'on',
					syndicationRedux: 'on'
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

			next = sinon.stub();

			await underTest(req, res, next);
		});

		after(function () {
			underTest = null;

			db.putItemAsync.restore();
			client.scanAsync.restore();
		});

		it('returns contract data', function () {
			expect(db.putItemAsync).to.have.been.calledWith(toPutItem(savedItem, HistorySchema));
		});

		it('redirects back to the /republishing/save page', function () {
			expect(res.redirect).to.have.been.calledWith('https://www.ft.com/republishing/save');
		});

		it('sets the http status to 204', function () {
			expect(res.sendStatus).to.not.have.been.called;
		});

		it('calls the next middleware function', function () {
			expect(next).to.not.have.been.called;
		});
	});
});
