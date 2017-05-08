const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
const proxyquire = require('proxyquire');

chai.use(sinonChai);

describe('checkIfNewSyndicationUser middleware', () => {
	let sandbox;
	let mocks;
	let stubs;
	let checkIfNewSyndicationUser;

	beforeEach(() => {
		sandbox = sinon.sandbox.create();
		mocks = {
			req: {},
			res: {
				locals: {
					flags: {
						syndicationNewOverride: false
					}
				},
				set: sandbox.stub()
			}
		};
		stubs = {
			logger: {
				default: {
					info: sandbox.stub()
				}
			},
			buildUserArray: sandbox.stub().returns(['hiya123']),
			decode: sandbox.stub(),
			next: sandbox.stub()
		};
		checkIfNewSyndicationUser = proxyquire('../../../server/middleware/check-if-new-syndication-user', {
			'@financial-times/n-logger': stubs.logger,
			'../lib/build-user-array': stubs.buildUserArray
		});
	});

	afterEach(() => sandbox.restore());;

	it('should set an FT-New-Syndication-User header if the user’s uuid is in the user array', () => {
		mocks.res.locals.userUuid = 'hiya123';

		checkIfNewSyndicationUser(mocks.req, mocks.res, stubs.next);

		expect(mocks.res.set).to.have.been.calledWith('FT-New-Syndication-User', 'true');
	});

	it('should set res.locals.isNewSyndicationUser as true if the user’s uuid is in the user array', () => {
		mocks.res.locals.userUuid = 'hiya123';

		checkIfNewSyndicationUser(mocks.req, mocks.res, stubs.next);

		expect(mocks.res.locals.isNewSyndicationUser).to.equal(true);
	});

	it('should call next if the user’s uuid is in the user array', () => {
		mocks.res.locals.userUuid = 'hiya123';

		checkIfNewSyndicationUser(mocks.req, mocks.res, stubs.next);

		expect(stubs.next).to.have.been.called;
	});

	it('should set res.locals.isNewSyndicationUser as true if the syndicationNewOverride flag is on', () => {
		mocks.res.locals.flags.syndicationNewOverride = true;

		checkIfNewSyndicationUser(mocks.req, mocks.res, stubs.next);

		expect(mocks.res.locals.isNewSyndicationUser).to.equal(true);
	});

	it('should set an FT-New-Syndication-User header if the syndicationNewOverride flag is on', () => {
		mocks.res.locals.flags.syndicationNewOverride = true;

		checkIfNewSyndicationUser(mocks.req, mocks.res, stubs.next);

		expect(mocks.res.set).to.have.been.calledWith('FT-New-Syndication-User', 'true');
	});

	it('should set isNewSyndicationUser to false if the user’s UUID is not in the user array and the syndicationNewOverride flag is off', () => {
		mocks.res.locals.userUuid = 'hiya456';
		mocks.res.locals.flags.syndicationNewOverride = false;

		checkIfNewSyndicationUser(mocks.req, mocks.res, stubs.next);

		expect(mocks.res.set).not.to.have.been.called;
		expect(mocks.res.locals.isNewSyndicationUser).to.equal(false);
	});

	it('should still call next if the user’s uuid is not in the user array', () => {
		mocks.res.locals.userUuid = 'hiya456';

		checkIfNewSyndicationUser(mocks.req, mocks.res, stubs.next);

		expect(stubs.next).to.have.been.called;
	});
});
