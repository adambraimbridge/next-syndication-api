'use strict';

const path = require('path');

const chai = require('chai');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

const {
	TEST: { FIXTURES_DIRECTORY }
} = require('config');

const { expect } = chai;
chai.use(sinonChai);

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe(MODULE_ID, function () {
	let db;
	let sandbox;
	let mocks;
	let stubs;
	let underTest;

	const { initDB } = require(path.resolve(`${FIXTURES_DIRECTORY}/massive`))();

	beforeEach(function () {
		db = initDB();

		underTest = proxyquire('../../../server/middleware/db', {
			'../../db/pg': sinon.stub().resolves(db)
		});

		sandbox = sinon.sandbox.create();
		mocks = {
			req: {},
			res: {
				locals: {}
			}
		};
		stubs = {
			next: sandbox.stub()
		};
	});

	afterEach(function () {
		sandbox.restore();
	});

	it('assigns a PostgreSQL DB instance to res.locals.$DB', async function () {
		await underTest(mocks.req, mocks.res, stubs.next);

		expect(mocks.res.locals).to.have.property('$DB')
			.and.to.be.an('object')
			.and.to.equal(db);
	});

	it('calls next', async function () {
		await underTest(mocks.req, mocks.res, stubs.next);

		expect(stubs.next).to.have.been.called;
	});

	describe('MAINTENANCE_MODE: true', function() {
		it('does not assign a db instance to res.locals.$DB', async function() {
			mocks.res.locals.MAINTENANCE_MODE = true;

			await underTest(mocks.req, mocks.res, stubs.next);

			expect(mocks.res.locals).to.not.have.property('$DB');
		});

		it('calls next', async function () {
			mocks.res.locals.MAINTENANCE_MODE = true;

			await underTest(mocks.req, mocks.res, stubs.next);

			expect(stubs.next).to.have.been.called;
		});
	});
});
