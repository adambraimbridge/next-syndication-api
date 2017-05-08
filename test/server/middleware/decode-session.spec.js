const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
const proxyquire = require('proxyquire');

chai.use(sinonChai);

describe('Decode session middleware', () => {
	let sandbox;
	let mocks;
	let stubs;
	let decodeSessionMiddleware;

	beforeEach(() => {
		sandbox = sinon.sandbox.create();
		mocks = {
			req: {
				cookies: {
					FTSession: '123'
				}
			},
			res: {
				locals: {},
				sendStatus: sandbox.stub()
			}
		};
		stubs = {
			logger: {
				default: {
					info: sandbox.stub()
				}
			},
			sessionDecoderClass: sandbox.stub(),
			decode: sandbox.stub(),
			next: sandbox.stub()
		};
		stubs.sessionDecoderClass.returns({ decode: stubs.decode });
		decodeSessionMiddleware = proxyquire('../../../server/middleware/decode-session', {
			'@financial-times/n-logger': stubs.logger,
			'@financial-times/session-decoder-js': stubs.sessionDecoderClass
		});
	});

	afterEach(() => sandbox.restore());;

	it('should send an unauthorised status code if no session token is found', () => {
		mocks.req.cookies.FTSession = undefined;

		decodeSessionMiddleware(mocks.req, mocks.res, stubs.next);

		expect(mocks.res.sendStatus).to.have.been.calledWith(401);
		expect(mocks.res.locals.userUuid).to.equal(undefined);
		expect(stubs.next).not.to.have.been.called;
	});

	it('should set a user uuid variable on res.locals', () => {
		stubs.decode.returns('abc');

		decodeSessionMiddleware(mocks.req, mocks.res, stubs.next);

		expect(mocks.res.sendStatus).not.to.have.been.called;
		expect(mocks.res.locals.userUuid).to.equal('abc');
		expect(stubs.next).to.have.been.called;
	});

	it('should send an bad request status code if an invalid session token is provided', () => {
		stubs.decode.throws();

		decodeSessionMiddleware(mocks.req, mocks.res, stubs.next);

		expect(mocks.res.sendStatus).to.have.been.calledWith(400);
		expect(mocks.res.locals.userUuid).to.equal(undefined);
		expect(stubs.next).not.to.have.been.called;
	});
});
