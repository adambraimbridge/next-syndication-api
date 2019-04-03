'use strict';

const path = require('path');

const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const proxyquire = require('proxyquire');

const { expect } = chai;
chai.use(sinonChai);

const { TEST: { FIXTURES_DIRECTORY } } = require('config');

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe(MODULE_ID, function () {
	let sandbox;
	let mocks;
	let stubs;
	let underTest;
	let db;
	let user_id;

	const contractResponse = require(path.resolve(`${FIXTURES_DIRECTORY}/contractResponse.json`));
	const { initDB } = require(path.resolve(`${FIXTURES_DIRECTORY}/massive`))();

	beforeEach(function () {
		user_id = '8ef593a8-eef6-448c-8560-9ca8cdca80a5';

		db = initDB();
		db.syndication.get_migrated_user.resolves([{
			contract_id: 'CA-00001558',
			last_modified: new Date(),
			user_id: user_id
		}]);

		sandbox = sinon.sandbox.create();
		mocks = {
			req: {},
			res: {
				locals: {
					$DB: db,
					contract: contractResponse,
					flags: {},
					user: {
						user_id: user_id,
						email: 'christos.constandinou@ft.com',
						first_name: 'christos',
						surname: 'constandinou'
					},
					userUuid: user_id
				},
				set: sandbox.stub()
			}
		};
		stubs = {
			logger: {
				debug: sandbox.stub(),
				error: sandbox.stub(),
				fatal: sandbox.stub(),
				info: sandbox.stub(),
				warn: sandbox.stub()
			},
			skipChecks: sandbox.stub().returns(true),
			decode: sandbox.stub(),
			next: sandbox.stub()
		};
		underTest = proxyquire('../../../server/middleware/check-if-new-syndication-user', {
			'../lib/logger': stubs.logger,
			'../helpers/flag-is-on': stubs.skipChecks
		});
	});

	afterEach(function () {
		sandbox.restore();
	});

	it('should call the get_migrated_user to check the user is migrated', async function () {
		await underTest(mocks.req, mocks.res, stubs.next);

		expect(db.syndication.get_migrated_user).to.have.been.calledWith([user_id, contractResponse.contract_id]);
	});

	it('should set an FT-New-Syndication-User header if the user is migrated', async function () {
		await underTest(mocks.req, mocks.res, stubs.next);

		expect(mocks.res.set).to.have.been.calledWith('FT-New-Syndication-User', 'true');
	});

	it('should set res.locals.isNewSyndicationUser as true if the user is migrated', async function () {
		await underTest(mocks.req, mocks.res, stubs.next);

		expect(mocks.res.locals.isNewSyndicationUser).to.equal(true);
	});

	it('should call next if the user is migrated', async function () {
		await underTest(mocks.req, mocks.res, stubs.next);

		expect(stubs.next).to.have.been.called;
	});

	describe('MAINTENANCE_MODE: true', function() {
		it('does not check the database', async function() {
			mocks.res.locals.MAINTENANCE_MODE = true;

			await underTest(mocks.req, mocks.res, stubs.next);

			expect(db.syndication.get_migrated_user).to.not.have.been.called;
		});

		it('should calls next', async function () {
			mocks.res.locals.MAINTENANCE_MODE = true;

			await underTest(mocks.req, mocks.res, stubs.next);

			expect(stubs.next).to.have.been.called;
		});
	});
});
