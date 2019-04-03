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
	let accessControl;

	beforeEach(function () {
		sandbox = sinon.sandbox.create();
		mocks = {
			req: {
				get: sandbox.stub()
			},
			res: {
				set: sandbox.stub(),
				sendStatus: sandbox.stub()
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
			next: sandbox.stub()
		};
		accessControl = proxyquire('../../../server/middleware/access-control', {
			'../lib/logger': stubs.logger
		});
	});

	afterEach(function () {
		sandbox.restore();
	});

	it('valid CORS preflight request from valid origin', function () {
		mocks.req.method = 'OPTIONS';
		mocks.req.get.withArgs('origin').returns('thing.ft.com');

		accessControl(mocks.req, mocks.res, stubs.next);

		expect(mocks.res.set).to.have.been.calledWith('Access-Control-Allow-Origin');
		expect(mocks.res.set).to.have.been.calledWith('Access-Control-Allow-Headers');
		expect(mocks.res.set).to.have.been.calledWith('Access-Control-Allow-Credentials');
		expect(mocks.res.set).to.have.been.calledWith('Access-Control-Expose-Headers');

		expect(mocks.res.sendStatus).to.have.been.calledWith(200);
		expect(stubs.next).not.to.have.been.called;
	});

	it('CORS preflight request from invalid origin', function () {
		mocks.req.method = 'OPTIONS';
		mocks.req.get.withArgs('origin').returns('thing.nope.com');

		accessControl(mocks.req, mocks.res, stubs.next);

		expect(mocks.res.set).not.to.have.been.called;
		expect(mocks.res.sendStatus).not.to.have.been.called;
		expect(stubs.next).to.have.been.called;
	});

	it('CORS GET request from a valid origin', function () {
		mocks.req.method = 'GET';
		mocks.req.get.withArgs('origin').returns('thing.ft.com');

		accessControl(mocks.req, mocks.res, stubs.next);

		expect(mocks.res.set).to.have.been.calledWith('Access-Control-Allow-Origin');
		expect(mocks.res.set).to.have.been.calledWith('Access-Control-Allow-Headers');
		expect(mocks.res.set).to.have.been.calledWith('Access-Control-Allow-Credentials');
		expect(mocks.res.set).to.have.been.calledWith('Access-Control-Expose-Headers');

		expect(mocks.res.sendStatus).not.to.have.been.called;
		expect(stubs.next).to.have.been.called;
	});

	it('CORS POST request from a valid origin', function () {
		mocks.req.method = 'POST';
		mocks.req.get.withArgs('origin').returns('thing.ft.com');

		accessControl(mocks.req, mocks.res, stubs.next);

		expect(mocks.res.set).to.have.been.calledWith('Access-Control-Allow-Origin');
		expect(mocks.res.set).to.have.been.calledWith('Access-Control-Allow-Headers');
		expect(mocks.res.set).to.have.been.calledWith('Access-Control-Allow-Credentials');
		expect(mocks.res.set).to.have.been.calledWith('Access-Control-Expose-Headers');

		expect(mocks.res.sendStatus).not.to.have.been.called;
		expect(stubs.next).to.have.been.called;
	});

	it('CORS GET request from invalid origin', function () {
		mocks.req.method = 'GET';
		mocks.req.get.withArgs('origin').returns('thing.nope.com');

		accessControl(mocks.req, mocks.res, stubs.next);

		expect(mocks.res.set).not.to.have.been.called;
		expect(mocks.res.sendStatus).not.to.have.been.called;
		expect(stubs.next).to.have.been.called;
	});

	it('CORS POST request from invalid origin', function () {
		mocks.req.method = 'POST';
		mocks.req.get.withArgs('origin').returns('thing.nope.com');

		accessControl(mocks.req, mocks.res, stubs.next);

		expect(mocks.res.set).not.to.have.been.called;
		expect(mocks.res.sendStatus).not.to.have.been.called;
		expect(stubs.next).to.have.been.called;
	});

	it('non-CORS GET request', function () {
		mocks.req.method = 'GET';

		accessControl(mocks.req, mocks.res, stubs.next);

		expect(mocks.res.set).not.to.have.been.called;
		expect(mocks.res.sendStatus).not.to.have.been.called;
		expect(stubs.next).to.have.been.called;
	});

	it('non-CORS POST request', function () {
		mocks.req.method = 'POST';

		accessControl(mocks.req, mocks.res, stubs.next);

		expect(mocks.res.set).not.to.have.been.called;
		expect(mocks.res.sendStatus).not.to.have.been.called;
		expect(stubs.next).to.have.been.called;
	});
});
