'use strict';

const path = require('path');

const sinon = require('sinon');
const expect = require('chai').expect;
const proxyquire = require('proxyquire');

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe(MODULE_ID, function () {
    let sandbox;
    let stubs;
    let validateBody;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        stubs = {
            logger: {
                default: {
                    info: sandbox.stub()
                }
            }
        };
        validateBody = proxyquire('../../../server/lib/validate-body', {
            '@financial-times/n-logger': stubs.logger
        });
    });

    afterEach(() => sandbox.restore());

    it('should return a promise', function () {
        const promise = validateBody({ content: [] });

        expect(promise.constructor === Promise).to.equal(true);
    });

    describe('The promise', function () {

        it('should reject when passed nothing at all', function (done) {
            validateBody()
                .then(() => done(new Error('Body was unexpectedly deemed valid')))
                .catch(() => done());
        });

        it('should reject when passed an empty string', function (done) {
            validateBody('')
                .then(() => done(new Error('Body was unexpectedly deemed valid')))
                .catch(() => done());
        });

        it('should reject when passed an object without the minimum required contents', function (done) {
            validateBody({ hiya: 'hiya' })
                .then(() => done(new Error('Body was unexpectedly deemed valid')))
                .catch(() => done());
        });

        it('should resolve when passed a string that, when JSON-parsed, contains the minimum required contents', function (done) {
            validateBody('{"content":[]}')
                .then(() => done())
                .catch(done);
        });

        it('should resolve when passed an acceptable object with the minimum required contents', function (done) {
            validateBody({ 'content': [] })
                .then(() => done())
                .catch(done);
        });

        it('should resolve with the inputted body when valid', function (done) {
            const input = {
                content: [
                    { uuid: '123' },
                    { uuid: '456' },
                    { uuid: '789' }
                ]
            };
            validateBody(input)
                .then(output => {
                    expect(output).to.deep.equal(input);
                })
                .then(done)
                .catch(done);
        });
    });
});
