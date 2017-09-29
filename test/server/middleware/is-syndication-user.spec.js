'use strict';

const path = require('path');

const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const nock = require('nock');
const proxyquire = require('proxyquire');

const { expect } = chai;
chai.use(sinonChai);

const {
	SESSION_PRODUCTS_PATH,
	SESSION_URI,
	SYNDICATION_PRODUCT_CODE,
	TEST: { FIXTURES_DIRECTORY }
} = require('config');

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe(MODULE_ID, function () {
	const { initDB } = require(path.resolve(`${FIXTURES_DIRECTORY}/massive`))();
	const userResponse = require(path.resolve(`${FIXTURES_DIRECTORY}/userResponse.json`));

	let db;
	let sandbox;
	let mocks;
	let stubs;
	let underTest;

	describe('MAINTENANCE_MODE: false', function() {
		beforeEach(function () {
			db = initDB();
			db.syndication.get_user.resolves([userResponse]);
			sandbox = sinon.sandbox.create();
			mocks = {
				req: {
					cookies: {
						FTSession: '123'
					},
					headers: {}
				},
				res: {
					locals: {
						$DB: db,
						userUuid: 'abc'
					},
					sendStatus: sandbox.stub()
				}
			};
			stubs = {
				logger: {
					default: {
						debug: sandbox.stub(),
						error: sandbox.stub(),
						fatal: sandbox.stub(),
						info: sandbox.stub(),
						warn: sandbox.stub()
					}
				},
				next: sandbox.stub()
			};

			underTest = proxyquire('../../../server/middleware/is-syndication-user', {
				'@financial-times/n-logger': stubs.logger
			});
		});

		afterEach(function () {
			sandbox.restore();
		});

		it('should send an unauthorised status code if the session service UUID does not match the session UUID', async function () {
			mocks.res.locals.userUuid = 'xyz';

			nock(SESSION_URI)
				.get(SESSION_PRODUCTS_PATH)
				.reply(200, { uuid: 'abc', products: 'Tools,S1,P0,P1,P2' }, {});

			await underTest(mocks.req, mocks.res, stubs.next);

			expect(mocks.res.sendStatus).to.have.been.calledWith(401);
			expect(stubs.next).not.to.have.been.called;
		});

		it(`should continue on if the session service products does contain ${SYNDICATION_PRODUCT_CODE} and the session service UUID matches the session UUID`, async function () {
			mocks.res.locals.userUuid = 'abc';

			nock(SESSION_URI)
				.get(SESSION_PRODUCTS_PATH)
				.reply(200, { uuid: 'abc', products: 'Tools,S1,P0,P1,P2' }, {});

			await underTest(mocks.req, mocks.res, stubs.next);

			expect(mocks.res.sendStatus).to.not.have.been.called;
			expect(stubs.next).to.have.been.called;
		});
	});

	describe('MAINTENANCE_MODE: true', function() {
		beforeEach(function () {
			db = initDB();
			db.syndication.get_user.resolves([userResponse]);
			sandbox = sinon.sandbox.create();
			mocks = {
				req: {
					cookies: {
						FTSession: '123'
					},
					headers: {}
				},
				res: {
					locals: {
						$DB: db,
						MAINTENANCE_MODE: true,
						userUuid: 'abc'
					},
					sendStatus: sandbox.stub()
				}
			};
			stubs = {
				logger: {
					default: {
						debug: sandbox.stub(),
						error: sandbox.stub(),
						fatal: sandbox.stub(),
						info: sandbox.stub(),
						warn: sandbox.stub()
					}
				},
				next: sandbox.stub()
			};

			underTest = proxyquire('../../../server/middleware/is-syndication-user', {
				'@financial-times/n-logger': stubs.logger
			});
		});

		afterEach(function () {
			sandbox.restore();
		});

		it('does not call the database', async function() {
			nock(SESSION_URI)
				.get(SESSION_PRODUCTS_PATH)
				.reply(200, { uuid: 'abc', products: 'Tools,S1,P0,P1,P2' }, {});

			await underTest(mocks.req, mocks.res, stubs.next);

			expect(db.syndication.get_user).to.not.have.been.called;
		});
	});
});
