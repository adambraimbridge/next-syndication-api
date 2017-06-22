'use strict';

const path = require('path');

const {expect} = require('chai');
const nock = require('nock');

const underTest = require('../../../server/lib/fetch-content-by-id');

const CONFIG = require('config');

const RE_VALID_URI = /^\/content\/([A-Za-z0-9]{8}(?:-[A-Za-z0-9]{4}){3}-[A-Za-z0-9]{12})$/;

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe(MODULE_ID, function () {
    describe('success', function () {

        beforeEach(function () {
            nock(CONFIG.BASE_URI_FT_API)
                .get(uri => RE_VALID_URI.test(uri))
                .reply(uri => {
                    return [
                        200,
                        require(`../../fixtures/${uri.match(RE_VALID_URI)[1]}`),
                        {}
                    ];
                });
        });

        after(function () {
            nock.cleanAll();
            nock.restore();
        });

        [
            '80d634ea-fa2b-46b5-886f-1418c6445182',
            'b59dff10-3f7e-11e7-9d56-25f963e998b2',
            'c7923fba-1d31-39fd-82f0-ba1822ef20d2',
            'd7bf1822-ec58-4a8e-a669-5cbcc0d6a1b2'
        ].forEach(contentId => {
            it(`should return a JSON representation of the content if it exists for content_id="${contentId}"`, function () {
                return underTest(contentId)
                    .then(res => {
                        expect(res).to.be.an('object');

                        expect(res).to.have.property('id').and.to.have.string(contentId);
                    });
            });
        });
    });

    describe('fail', function () {
        after(function () {
            nock.cleanAll();
            nock.restore();
        });

        [
            'fakenews-fa2b-46b5-886f-1418c6445182',
            'fakenews-3f7e-11e7-9d56-25f963e998b2',
            'fakenews-1d31-39fd-82f0-ba1822ef20d2',
            'fakenews-ec58-4a8e-a669-5cbcc0d6a1b2'
        ].forEach(contentId => {
            const httpStatus = 400;
            const message = 'Bad Request';

            describe(`content_id="${contentId}"; status=${httpStatus}`, function () {
                before(function () {
                    nock(CONFIG.BASE_URI_FT_API)
                        .get(uri => RE_VALID_URI.test(uri))
                        .reply(() => {
                            return [
                                httpStatus,
                                message,
                                {}
                            ];
                        });
                });

                it('should return the error if the content does not exist', function () {
                    return underTest(contentId)
                        .then(res => {
                            expect(res).to.be.a('string');

                            expect(res).to.equal(message);
                        });
                });

            });
        });
    });
});
