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

const { expect } = chai;
chai.use(sinonChai);

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe(MODULE_ID, function () {
	let underTest;

	const { initDB } = require(path.resolve(`${FIXTURES_DIRECTORY}/massive`))();

	describe('referrer !== /republishing/save', function () {
		const deletedItem = {
			'_id': '9807a4b6dcb3ce1188593759dd6818cd',
			'contract_id': 'FTS-14029674',
			'asset_type': 'FT Article',
			'content_id': 'http://www.ft.com/thing/80d634ea-fa2b-46b5-886f-1418c6445182',
			'user_id': '8ef593a8-eef6-448c-8560-9ca8cdca80a5',
			'time': '2017-07-26T12:44:26.135Z',
			'state': 'deleted',
			'content_type': 'article',
			'title': 'FT View: Brexit rethink required',
			'published_date': '2017-06-19T12:47:54.753Z',
			'syndication_state': 'verify',
			'last_modified': '2017-08-19T12:47:54.753Z'
		};
		let next;
		let req;
		let res;

		before(async function () {
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

			const db = initDB();

			db.syndication.delete_save_history_by_contract_id.resolves([deletedItem]);

			res.locals = {
				$DB: db,
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
					user_id: 'abc',
					lastName: 'bar'
				},
				userUuid: 'abc'
			};

			next = sinon.stub();

			await underTest(req, res, next);
		});

		after(function () {
			underTest = null;;
		});

		it('calls the syndication.delete_save_history_by_contract_id stored procedure', function () {
			expect(res.locals.$DB.syndication.delete_save_history_by_contract_id).to.have.been.calledWith([res.locals.syndication_contract.id, deletedItem.content_id]);
		});

		it('sets the http status to 204', function () {
			expect(res.sendStatus).to.have.been.calledWith(204);
		});

		it('calls the next middleware function', function () {
			expect(next).to.have.been.called;
		});
	});

	describe('referrer === /republishing/save', function () {
		const deletedItem = {
			'_id': '9807a4b6dcb3ce1188593759dd6818cd',
			'contract_id': 'FTS-14029674',
			'asset_type': 'FT Article',
			'content_id': 'http://www.ft.com/thing/80d634ea-fa2b-46b5-886f-1418c6445182',
			'user_id': '8ef593a8-eef6-448c-8560-9ca8cdca80a5',
			'time': '2017-07-26T12:44:26.135Z',
			'state': 'deleted',
			'content_type': 'article',
			'title': 'FT View: Brexit rethink required',
			'published_date': '2017-06-19T12:47:54.753Z',
			'syndication_state': 'verify',
			'last_modified': '2017-08-19T12:47:54.753Z'
		};
		let next;
		let req;
		let res;

		before(async function () {
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

			const db = initDB();

			db.syndication.delete_save_history_by_contract_id.resolves([deletedItem]);

			res.locals = {
				$DB: db,
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
		});

		it('calls the syndication.delete_save_history_by_contract_id stored procedure', function () {
			expect(res.locals.$DB.syndication.delete_save_history_by_contract_id).to.have.been.calledWith([res.locals.syndication_contract.id, deletedItem.content_id]);
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
