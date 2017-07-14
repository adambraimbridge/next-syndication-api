'use strict';

const path = require('path');

const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const proxyquire = require('proxyquire');

const { expect } = chai;
chai.use(sinonChai);

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe(MODULE_ID, function () {
	let sandbox;
	let mocks;
	let stubs;
	let checkIfNewSyndicationUser;

	beforeEach(function () {
		sandbox = sinon.sandbox.create();
		mocks = {
			req: {},
			res: {
				locals: {
					flags: {
						syndicationNewOverride: false,
						syndicationRedux: false
					}
				},
				set: sandbox.stub()
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
			skipChecks: sandbox.stub().returns(true),
			decode: sandbox.stub(),
			next: sandbox.stub()
		};
		checkIfNewSyndicationUser = proxyquire('../../../server/middleware/check-if-new-syndication-user', {
			'@financial-times/n-logger': stubs.logger,
			'../helpers/flag-is-on': stubs.skipChecks
		});
	});

	afterEach(function () {
		sandbox.restore();
	});

	it('should set an FT-New-Syndication-User header if the user’s uuid is in the user array', function () {
		mocks.res.locals.userUuid = 'hiya123';

		checkIfNewSyndicationUser(mocks.req, mocks.res, stubs.next);

		expect(mocks.res.set).to.have.been.calledWith('FT-New-Syndication-User', 'true');
	});

	it('should set res.locals.isNewSyndicationUser as true if the user’s uuid is in the user array', function () {
		mocks.res.locals.userUuid = 'hiya123';

		checkIfNewSyndicationUser(mocks.req, mocks.res, stubs.next);

		expect(mocks.res.locals.isNewSyndicationUser).to.equal(true);
	});

	it('should call next if the user’s uuid is in the user array', function () {
		mocks.res.locals.userUuid = 'hiya123';

		checkIfNewSyndicationUser(mocks.req, mocks.res, stubs.next);

		expect(stubs.next).to.have.been.called;
	});

	it('should set res.locals.isNewSyndicationUser as true if the syndicationRedux flag is on', function () {
		mocks.res.locals.flags.syndicationNewOverride = true;
		mocks.res.locals.flags.syndicationRedux = true;

		checkIfNewSyndicationUser(mocks.req, mocks.res, stubs.next);

		expect(mocks.res.locals.isNewSyndicationUser).to.equal(true);
	});

	it('should set an FT-New-Syndication-User header if the syndicationRedux flag is on', function () {
		mocks.res.locals.flags.syndicationNewOverride = true;
		mocks.res.locals.flags.syndicationRedux = true;

		checkIfNewSyndicationUser(mocks.req, mocks.res, stubs.next);

		expect(mocks.res.set).to.have.been.calledWith('FT-New-Syndication-User', 'true');
	});

//	it('should set isNewSyndicationUser to false if the user’s UUID is not in the user array and the syndicationRedux flag is off', function () {
//		mocks.res.locals.userUuid = 'hiya456';
//		mocks.res.locals.flags.syndicationNewOverride = false;
//		mocks.res.locals.flags.syndicationRedux = false;
//
//		checkIfNewSyndicationUser(mocks.req, mocks.res, stubs.next);
//
//		expect(mocks.res.set).not.to.have.been.called;
//		expect(mocks.res.locals.isNewSyndicationUser).to.equal(false);
//	});

	it('should still call next if the user’s uuid is not in the user array', function () {
		mocks.res.locals.userUuid = 'hiya456';

		checkIfNewSyndicationUser(mocks.req, mocks.res, stubs.next);

		expect(stubs.next).to.have.been.called;
	});
});
