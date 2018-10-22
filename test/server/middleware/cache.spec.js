'use strict';

const path = require('path');

const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const cacheMiddleware = require('../../../server/middleware/cache');

const { expect } = chai;
chai.use(sinonChai);

const MODULE_ID =
	path.relative(`${process.cwd()}/test`, module.id) ||
	require(path.resolve('./package.json')).name;

describe(MODULE_ID, function() {
	let sandbox;
	let mocks;
	let stubs;

	beforeEach(function() {
		sandbox = sinon.sandbox.create();
		mocks = {
			req: {},
			res: {
				set: sandbox.stub(),
				FT_NO_CACHE: 'FT_NO_CACHE',
			},
		};
		stubs = {
			next: sandbox.stub(),
		};
	});

	afterEach(function() {
		sandbox.restore();
	});

	it('sets the expected cache headers (no caching for now)', function() {
		cacheMiddleware(mocks.req, mocks.res, stubs.next);

		expect(mocks.res.set).to.have.been.calledWith(
			'Surrogate-Control',
			mocks.res.FT_NO_CACHE
		);
		expect(mocks.res.set).to.have.been.calledWith(
			'Cache-Control',
			mocks.res.FT_NO_CACHE
		);
	});

	it('calls next', function() {
		cacheMiddleware(mocks.req, mocks.res, stubs.next);
		expect(stubs.next).to.have.been.called;
	});
});
