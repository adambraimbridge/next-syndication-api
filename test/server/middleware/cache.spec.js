const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
const cacheMiddleware = require('../../../server/middleware/cache');

chai.use(sinonChai);

describe('Cache middleware', () => {
	let sandbox;
	let mocks;
	let stubs;

	beforeEach(() => {
		sandbox = sinon.sandbox.create();
		mocks = {
			req: {},
			res: {
				set: sandbox.stub(),
				FT_NO_CACHE: 'FT_NO_CACHE'
			}
		};
		stubs = {
			next: sandbox.stub()
		};
	});

	afterEach(() => sandbox.restore());

	it('sets the expected cache headers (no caching for now)', () => {
		cacheMiddleware(mocks.req, mocks.res, stubs.next);

		expect(mocks.res.set).to.have.been.calledWith('Surrogate-Control', mocks.res.FT_NO_CACHE);
		expect(mocks.res.set).to.have.been.calledWith('Cache-Control', mocks.res.FT_NO_CACHE);
	});

	it('calls next', () => {
		cacheMiddleware(mocks.req, mocks.res, stubs.next);
		expect(stubs.next).to.have.been.called;
	});
});
