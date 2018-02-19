'use strict';

const path = require('path');

const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const proxyquire = require('proxyquire');

const { expect } = chai;
chai.use(sinonChai);

const {
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

	beforeEach(function () {
		db = initDB([{
			contract_id: 'CA-00001558',
			last_modified: new Date(),
			user_id: userResponse.user_id
		}]);
		db.syndication.get_user.resolves([userResponse]);
		db.syndication.get_migrated_user.resolves([userResponse]);

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
					flags: {},
					userUuid: userResponse.user_id
				}
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

		underTest = proxyquire('../../../server/middleware/expedite-user-auth', {
			'@financial-times/n-logger': stubs.logger
		});
	});

	afterEach(function () {
		sandbox.restore();
	});

	it('continues on if the user is not in the DB', async function () {
		mocks.res.locals.userUuid = 'xyz';

		await underTest(mocks.req, mocks.res, stubs.next);

		expect(mocks.res.locals.EXPEDITED_USER_AUTH).to.not.be.true;

		expect(stubs.next).to.have.been.called;
	});

	it('sets res.locals.user and res.locals.EXPEDITED_USER_AUTH if user is in the DB', async function () {
		mocks.res.locals.userUuid = userResponse.user_id;
		userResponse.last_modified = new Date();

		await underTest(mocks.req, mocks.res, stubs.next);

		expect(mocks.res.locals.user).to.eql(userResponse);
		expect(stubs.next).to.have.been.called;
		expect(mocks.res.locals.EXPEDITED_USER_AUTH).to.be.true;
	});

	describe('MAINTENANCE_MODE: true', function() {
		it('does not call the database', async function() {
			mocks.res.locals.MAINTENANCE_MODE = true;

			await underTest(mocks.req, mocks.res, stubs.next);

			expect(db.run).to.not.have.been.called;
			expect(db.syndication.get_user).to.not.have.been.called;
		});
	});
});
