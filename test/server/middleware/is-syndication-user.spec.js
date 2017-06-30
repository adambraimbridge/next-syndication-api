'use strict';

const path = require('path');

const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
const nock = require('nock');
const proxyquire = require('proxyquire');

chai.use(sinonChai);

const {
	SESSION_PRODUCTS_PATH,
	SESSION_URI,
	SYNDICATION_PRODUCT_CODE
} = require('config');

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe(MODULE_ID, function () {
	let sandbox;
	let mocks;
	let stubs;
	let underTest;

	beforeEach(function () {
		sandbox = sinon.sandbox.create();
		mocks = {
			req: {
				cookies: {
					FTSession: '123'
				},
				headers: {}
			},
			res: {
				locals: {},
				sendStatus: sandbox.stub()
			}
		};
		stubs = {
			logger: {
				default: {
					info: sandbox.stub()
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

//	it('should send an unauthorised status code if the session service returns a 404', async function () {
//		nock(SESSION_URI)
//			.get(SESSION_PRODUCTS_PATH)
//			.reply(404, 'Not Found', {});
//
//		await underTest(mocks.req, mocks.res, stubs.next);
//
//		expect(mocks.res.sendStatus).to.have.been.calledWith(401);
//
//		expect(stubs.next).not.to.have.been.called;
//	});

	it(`should send an unauthorised status code if the session service products does NOT contain ${SYNDICATION_PRODUCT_CODE}`, async function () {
		nock(SESSION_URI)
			.get(SESSION_PRODUCTS_PATH)
			.reply(200, { uuid: 'abc', products: 'Tools,P0,P1,P2' }, {});

		await underTest(mocks.req, mocks.res, stubs.next);

		expect(mocks.res.sendStatus).to.have.been.calledWith(401);
		expect(stubs.next).not.to.have.been.called;
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
