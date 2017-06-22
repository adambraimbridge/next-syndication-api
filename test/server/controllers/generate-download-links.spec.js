'use strict';

const path = require('path');

const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
const proxyquire = require('proxyquire');

chai.use(sinonChai);

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe(MODULE_ID, () => {
    let sandbox;
    let mocks;
    let stubs;
    let generateDownloadLinks;

    beforeEach(() => {
        sandbox = sinon.sandbox.create();
        mocks = {
            req: {},
            res: {
                json: sandbox.stub(),
                locals: {}
            },
            body: {
                content: [
                    {
                        uuid: 'hiya123'
                    }
                ]
            },
            populatedBody: {
                content: [
                    {
                        uuid: 'hiya123',
                        links: [{
                            format: 'docx',
                            url: 'url'
                        }]
                    }
                ]
            }
        };
        stubs = {
            validateBody: sandbox.stub().returns(Promise.resolve(mocks.body)),
            populateDownloadLinks: sandbox.stub().returns(mocks.populatedBody.content[0]),
            next: sandbox.stub()
        };
        generateDownloadLinks = proxyquire('../../../server/controllers/generate-download-links', {
            '../lib/validate-body': stubs.validateBody,
            '../lib/populate-download-links': stubs.populateDownloadLinks
        });
    });

    afterEach(() => sandbox.restore());

    it('should call res.json with an empty object if the user isn’t opted into using the syndication API', done => {
        generateDownloadLinks(mocks.req, mocks.res, stubs.next)
            .then(() => {
                expect(mocks.res.json).to.have.been.calledWith({});
            })
            .then(done)
            .catch(done);
    });

    it('should call res.json with populated content if the user is opted into using the syndication API', done => {
        mocks.res.locals.isNewSyndicationUser = true;

        generateDownloadLinks(mocks.req, mocks.res, stubs.next)
            .then(() => {
                expect(mocks.res.json).to.have.been.calledWith(mocks.populatedBody);
            })
            .then(done)
            .catch(done);
    });

});
