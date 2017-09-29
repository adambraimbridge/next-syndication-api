'use strict';

const path = require('path');

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

const { expect } = chai;
chai.use(sinonChai);

const underTest = require('../../../server/middleware/flag-maintenance-mode');

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe.only(MODULE_ID, function () {
	let sandbox;
	let mocks;
	let stubs;

	beforeEach(function () {
		sandbox = sinon.sandbox.create();
		mocks = {
			req: {},
			res: {
				locals: { flags: {} }
			}
		};
		stubs = {
			next: sandbox.stub()
		};
	});

	afterEach(function () {
		sandbox.restore();
	});

	it('assigns `MAINTENANCE_MODE: true` on res.locals, if the `syndicationMaintenance` feature flag is enabled', async function () {
		mocks.res.locals.flags.syndicationMaintenance = true;

		await underTest(mocks.req, mocks.res, stubs.next);

		expect(mocks.res.locals).to.have.property('MAINTENANCE_MODE')
			.and.to.be.an('boolean')
			.and.to.be.true;
	});

	it('assigns `MAINTENANCE_MODE: false` on res.locals, if the `syndicationMaintenance` feature flag is disabled', async function () {
		mocks.res.locals.flags.syndicationMaintenance = false;

		await underTest(mocks.req, mocks.res, stubs.next);

		expect(mocks.res.locals).to.have.property('MAINTENANCE_MODE')
			.and.to.be.an('boolean')
			.and.to.be.false;
	});

	it('calls next', async function () {
		await underTest(mocks.req, mocks.res, stubs.next);

		expect(stubs.next).to.have.been.called;
	});
});
