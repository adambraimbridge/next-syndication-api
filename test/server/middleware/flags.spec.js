'use strict';

const path = require('path');

const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
const flagsMiddleware = require('../../../server/middleware/flags');

chai.use(sinonChai);

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe(MODULE_ID, function () {
    let sandbox;
    let mocks;
    let stubs;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        mocks = {
            res: {
                locals: {
                    flags: {}
                },
                sendStatus: sandbox.stub()
            }
        };
        stubs = {
            next: sandbox.stub()
        };
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('should call next if the syndicationNew flag is on', function () {
        mocks.res.locals.flags.syndicationNew = true;

        flagsMiddleware(mocks.req, mocks.res, stubs.next);

        expect(stubs.next).to.have.been.called;
        expect(mocks.res.sendStatus).not.to.have.been.called;
    });

    it('should send a not-found status code if the syndicationNew flag is off', function () {
        mocks.res.locals.flags.syndicationNew = false;

        flagsMiddleware(mocks.req, mocks.res, stubs.next);

        expect(stubs.next).not.to.have.been.called;
        expect(mocks.res.sendStatus).to.have.been.calledWith(404);
    });
});
