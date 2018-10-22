'use strict';

const path = require('path');

const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const proxyquire = require('proxyquire');

const { expect } = chai;
chai.use(sinonChai);

const { BASE_URI_FT_API } = require('config');

const MODULE_ID =
	path.relative(`${process.cwd()}/test`, module.id) ||
	require(path.resolve('./package.json')).name;

describe(MODULE_ID, function() {
	let sandbox;
	let mocks;
	let stubs;
	let underTest;

	beforeEach(function() {
		sandbox = sinon.sandbox.create();
		mocks = {
			req: {
				cookies: {
					FTSession: '123',
				},
				headers: {},
			},
			res: {
				locals: {
					userUuid: 'abc',
				},
				sendStatus: sandbox.stub(),
			},
		};
		stubs = {
			fetch: sandbox.stub().returns({
				url: `${BASE_URI_FT_API}/authorize#access_token=abc.123.xyz&scope=licence_data`,
			}),
			logger: {
				default: {
					debug: sandbox.stub(),
					error: sandbox.stub(),
					fatal: sandbox.stub(),
					info: sandbox.stub(),
					warn: sandbox.stub(),
				},
			},
			next: sandbox.stub(),
		};

		underTest = proxyquire(
			'../../../server/middleware/get-licence-access-auth-token',
			{
				'@financial-times/n-logger': stubs.logger,
				'n-eager-fetch': stubs.fetch,
			}
		);
	});

	afterEach(function() {
		sandbox.restore();
	});

	it('should assign the access token to `res.locals.ACCESS_TOKEN_LICENCE`', async function() {
		await underTest(mocks.req, mocks.res, stubs.next);

		const { ACCESS_TOKEN_LICENCE } = mocks.res.locals;

		expect(ACCESS_TOKEN_LICENCE)
			.to.be.a('string')
			.and.to.equal('abc.123.xyz');
	});
});
