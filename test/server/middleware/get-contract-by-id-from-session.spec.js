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

const httpMocks = require(path.resolve(`${FIXTURES_DIRECTORY}/node-mocks-http`));

const { expect } = chai;
chai.use(sinonChai);

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe(MODULE_ID, function () {
	describe('success', function () {
		const contractResponse = require(path.resolve(`${FIXTURES_DIRECTORY}/contractResponse.json`));
		let db;
		let next;
		let req;
		let res;
		let getContractStub;

		const { initDB } = require(path.resolve(`${FIXTURES_DIRECTORY}/massive`))();

		describe('MAINTENANCE_MODE: false', function() {
			beforeEach(async function () {
				db = initDB();
				db.syndication.upsert_contract_users.resolves([{
					contract_id: contractResponse.contract_id,
					user_id: 'abc',
					owner: false,
					last_modified: new Date()
				}]);

				getContractStub = sinon.stub().resolves(contractResponse);

				const underTest = proxyquire('../../../server/middleware/get-contract-by-id-from-session', {
					'../lib/get-contract-by-id': getContractStub
				});

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
					'query': {
						'format': 'docx'
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

				res.locals = {
					$DB: db,
					contract: contractResponse,
					flags: {
						syndication: true
					},
					licence: { id: 'xyz' },
					syndication_contract: {
						id: 'lmno'
					},
					user: {
						download_format: 'docx',
						email: 'christos.constandinou@ft.com',
						user_id: '8ef593a8-eef6-448c-8560-9ca8cdca80a5'
					},
					userUuid: '8ef593a8-eef6-448c-8560-9ca8cdca80a5'
				};

				next = sinon.stub();

				await underTest(req, res, next);
			});

			it('calls the syndication.upsert_contract_users stored procedure function', function () {
				expect(res.locals.$DB.syndication.upsert_contract_users).to.be.calledWith([res.locals.syndication_contract.id, res.locals.userUuid, false]);
			});

			it('sets contract data on res.locals', function () {
				expect(res.locals.contract).to.eql(contractResponse);
			});
		});


		describe('MAINTENANCE_MODE: true', function() {
			beforeEach(async function () {
				db = initDB();
				db.syndication.upsert_contract_users.resolves([{
					contract_id: contractResponse.contract_id,
					user_id: 'abc',
					owner: false,
					last_modified: new Date()
				}]);

				getContractStub = sinon.stub().resolves(contractResponse);

				const underTest = proxyquire('../../../server/middleware/get-contract-by-id-from-session', {
					'../lib/get-contract-by-id': getContractStub
				});

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
					'query': {
						'format': 'docx'
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

				res.locals = {
					$DB: db,
					contract: contractResponse,
					flags: {
						syndication: true
					},
					licence: { id: 'xyz' },
					syndication_contract: {
						id: 'lmno'
					},
					MAINTENANCE_MODE: true,
					user: {
						download_format: 'docx',
						email: 'christos.constandinou@ft.com',
						user_id: '8ef593a8-eef6-448c-8560-9ca8cdca80a5'
					},
					userUuid: '8ef593a8-eef6-448c-8560-9ca8cdca80a5'
				};

				next = sinon.stub();

				await underTest(req, res, next);
			});

			it('does not call the database', async function() {
				expect(res.locals.$DB.syndication.upsert_contract_users).to.not.have.been.called;
			});

			it('try to get the contract from salesforce', async function() {
				expect(getContractStub).to.not.have.been.called;
			});
		});
	});
});
