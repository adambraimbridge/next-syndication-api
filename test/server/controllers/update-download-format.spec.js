'use strict';

const { EventEmitter } = require('events');
const path = require('path');
const { Writable: WritableStream } = require('stream');

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

const {
	TEST: { FIXTURES_DIRECTORY }
} = require('config');

const httpMocks = require(path.resolve(`${FIXTURES_DIRECTORY}/node-mocks-http`));

const { expect } = chai;
chai.use(sinonChai);

const underTest = require('../../../server/controllers/update-download-format');

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe(MODULE_ID, function () {
	const { initDB } = require(path.resolve(`${FIXTURES_DIRECTORY}/massive`))();

	describe('success', function () {
		const contractResponse = require(path.resolve(`${FIXTURES_DIRECTORY}/contractResponse.json`));

		let next;
		let req;
		let res;

		before(async function () {
			req = httpMocks.createRequest({
				'eventEmitter': EventEmitter,
				'connection': new EventEmitter(),
				'headers': {
					'ft-real-url': 'https://www.ft.com/syndication/contract-status',
					'ft-real-path': '/syndication/contract-status',
					'ft-vanity-url': '/syndication/contract-status',
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
				'originalUrl': '/syndication/contract-status',
				'params': {},
				'path': '/syndication/contract-status',
				'protocol': 'http',
				'body': {
					'format': 'plain'
				},
				'url': '/syndication/contract-status'
			});

			res = httpMocks.createResponse({
				req,
				writableStream: WritableStream
			});

			res.sendStatus = sinon.stub();
			res.status = sinon.stub();
			res.json = sinon.stub();

			const db = initDB();

			db.syndication.upsert_user.resolves([{
				download_format: 'plain',
				email: 'foo@bar.com',
				first_name: 'foo',
				user_id: 'abc',
				surname: 'bar',
				last_modified: (new Date()).toJSON()
			}]);

			res.locals = {
				$DB: db,
				contract: contractResponse,
				flags: {
					syndication: true,
					syndicationRedux: 'on'
				},
				licence: { id: 'xyz' },
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

			next = sinon.stub();

			await underTest(req, res, next);
		});

		it('calls syndication.update_user stored procedure function', function () {
			expect(res.locals.$DB.syndication.upsert_user).to.have.been.calledWith([{
				download_format: 'plain',
				email: 'foo@bar.com',
				first_name: 'foo',
				user_id: 'abc',
				surname: 'bar'
			}]);
		});

		it('sets the http status to 204', function () {
			expect(res.sendStatus).to.have.been.calledWith(204);
		});

		it('calls the next middleware function', function () {
			expect(next).to.have.been.called;
		});
	});
});
