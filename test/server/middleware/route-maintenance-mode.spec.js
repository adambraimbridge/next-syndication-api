'use strict';

const path = require('path');

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

const { expect } = chai;
chai.use(sinonChai);

const underTest = require('../../../server/middleware/route-maintenance-mode');

const MODULE_ID =
	path.relative(`${process.cwd()}/test`, module.id) ||
	require(path.resolve('./package.json')).name;

describe(MODULE_ID, function() {
	let sandbox;
	let mocks;
	let stubs;

	describe('MAINTENANCE_MODE: true', function() {
		afterEach(function() {
			sandbox.restore();
		});

		beforeEach(function() {
			sandbox = sinon.sandbox.create();
			mocks = {
				req: {},
				res: {
					locals: { MAINTENANCE_MODE: true },
					json: sinon.stub(),
					status: sinon.stub(),
				},
			};
			stubs = {
				next: sandbox.stub(),
			};
		});

		it('calls res.status with 503', function() {
			underTest(mocks.req, mocks.res, stubs.next);

			expect(mocks.res.status).to.have.been.calledWith(503);
		});

		it('calls res.json with MAINTENANCE_MESSAGE', function() {
			underTest(mocks.req, mocks.res, stubs.next);

			expect(mocks.res.json).to.have.been.calledWith({
				message:
					'The Republishing Service is currently undergoing maintenance. Please try again later.',
			});
		});

		it('does not call next', function() {
			underTest(mocks.req, mocks.res, stubs.next);

			expect(stubs.next).to.not.have.been.called;
		});
	});

	describe('MAINTENANCE_MODE: false', function() {
		afterEach(function() {
			sandbox.restore();
		});

		beforeEach(function() {
			sandbox = sinon.sandbox.create();
			mocks = {
				req: {},
				res: {
					locals: { MAINTENANCE_MODE: false },
					json: sinon.stub(),
					status: sinon.stub(),
				},
			};
			stubs = {
				next: sandbox.stub(),
			};
		});

		it('does not call res.status', function() {
			underTest(mocks.req, mocks.res, stubs.next);

			expect(mocks.res.status).to.not.have.been.called;
		});

		it('does not call res.json', function() {
			underTest(mocks.req, mocks.res, stubs.next);

			expect(mocks.res.json).to.not.have.been.called;
		});

		it('calls next', function() {
			underTest(mocks.req, mocks.res, stubs.next);

			expect(stubs.next).to.have.been.called;
		});
	});
});
