'use strict';

const path = require('path');

const {expect} = require('chai');
const nock = require('nock');

const mime = require('mime-types');

const {
    BASE_URI_FT_API,
    DOWNLOAD_ARCHIVE_EXTENSION,
    DOWNLOAD_ARTICLE_FORMATS,
//    DOWNLOAD_ARTICLE_EXTENSION_OVERRIDES,
    DOWNLOAD_FILENAME_PREFIX
} = require('config');

const underTest = require('../../../server/lib/get-content-by-id');

const RE_BAD_CHARS = /[^A-Za-z0-9_]/gm;
const RE_SPACE = /\s/gm;
const RE_VALID_URI = /^\/content\/([A-Za-z0-9]{8}(?:-[A-Za-z0-9]{4}){3}-[A-Za-z0-9]{12})$/;

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe(MODULE_ID, function () {

    before(function () {
        nock.disableNetConnect(BASE_URI_FT_API);
    });

    after(function () {
        nock.enableNetConnect(BASE_URI_FT_API);
    });

    describe('success', function () {
        beforeEach(function () {
            nock(BASE_URI_FT_API)
                .get(uri => RE_VALID_URI.test(uri))
                .reply(uri => {
                    return [
                        200,
                        require(`../../fixtures/${uri.match(RE_VALID_URI)[1]}`),
                        {}
                    ];
                });
        });

        describe('type: Article', function () {
            [
                'b59dff10-3f7e-11e7-9d56-25f963e998b2',
                'c7923fba-1d31-39fd-82f0-ba1822ef20d2'
            ].forEach(contentId => {
                it(`should return a JSON representation of the content if it exists for content_id="${contentId}"`, function () {
                    return underTest(contentId)
                        .then(content => {
                            expect(content).to.be.an('object');

                            expect(content).to.have.property('id')
                                .and.to.have.string(contentId);
                        });
                });

                it(`should have a \`__doc:xmldom.Documnet\` for content_id="${contentId}"`, function () {
                    return underTest(contentId)
                        .then(content => {
                            expect(content.__doc.constructor.name).to.equal('Document');
                        });
                });

                it(`should have a \`__wordCount:Number\` for content_id="${contentId}"`, function () {
                    return underTest(contentId)
                        .then(content => {
                            expect(content).to.have.property('__wordCount')
                                .and.to.be.a('number');
                        });
                });

                it(`should have a \`bodyXML__CLEAN:String\` for content_id="${contentId}"`, function () {
                    return underTest(contentId)
                        .then(content => {
                            expect(content).to.have.property('bodyXML__CLEAN')
                                .and.to.be.a('string');
                        });
                });

                describe(`should have a \`extension:String\` based on the passed format for content_id="${contentId}"`, function () {
                    [
                        undefined,
                        'docx',
                        'text',
                        'html'
                    ].forEach(format => {
                        it(`format = ${format}`, function () {
                            let extension = DOWNLOAD_ARTICLE_FORMATS[format] || 'docx';

                            return underTest(contentId, format)
                                .then(content => {
                                    expect(content).to.have.property('extension')
                                        .and.to.be.a('string')
                                        .and.equal(extension);
                                });
                        });
                    });
                });

                it(`should have a \`fileName:String\` for content_id="${contentId}"`, function () {
                    return underTest(contentId)
                        .then(content => {
                            expect(content).to.have.property('fileName')
                                .and.to.be.a('string')
                                .and.to.equal(DOWNLOAD_FILENAME_PREFIX + content.title.replace(RE_SPACE, '_').replace(RE_BAD_CHARS, '').substring(0, 12));
                        });
                });
            });
        });

        describe('type: MediaResource', function () {
            [
                '80d634ea-fa2b-46b5-886f-1418c6445182',
                'd7bf1822-ec58-4a8e-a669-5cbcc0d6a1b2'
            ].forEach(contentId => {
                it(`should return a JSON representation of the content if it exists for content_id="${contentId}"`, function () {
                    return underTest(contentId)
                        .then(content => {
                            expect(content).to.be.an('object');

                            expect(content).to.have.property('id')
                                .and.to.have.string(contentId);
                        });
                });

                it(`should have a \`dataSource:Array\` for content_id="${contentId}"`, function () {
                    return underTest(contentId)
                        .then(content => {
                            expect(content).to.have.property('dataSource')
                                .and.to.be.an('array')
                                .and.to.have.length.at.least(1);
                        });
                });

                it(`should have a \`extension:String\` which is an Archive format for content_id="${contentId}"`, function () {
                    return underTest(contentId)
                        .then(content => {
                            expect(content).to.have.property('extension')
                                .and.to.be.a('string')
                                .and.equal(DOWNLOAD_ARCHIVE_EXTENSION);
                        });
                });

                it(`should have a \`download:Object\` which is the final item in the \`dataSource:Array\` for content_id="${contentId}"`, function () {
                    return underTest(contentId)
                        .then(content => {
                            expect(content).to.have.property('download')
                                .and.to.be.an('object')
                                .and.equal(content.dataSource[content.dataSource.length - 1]);
                        });
                });

                it(`should have a \`download.extension:Object\` based on the \`mediaType\` for content_id="${contentId}"`, function () {
                    return underTest(contentId)
                        .then(content => {
                            expect(content.download).to.have.property('extension')
                                .and.to.equal(mime.extension(content.download.mediaType));
                        });
                });

                it(`should have a \`fileName:String\` for content_id="${contentId}"`, function () {
                    return underTest(contentId)
                        .then(content => {
                            expect(content).to.have.property('fileName')
                                .and.to.be.a('string')
                                .and.to.equal(DOWNLOAD_FILENAME_PREFIX + content.title.replace(RE_SPACE, '_').replace(RE_BAD_CHARS, '').substring(0, 12));
                        });
                });
            });
        });

        describe('type: MediaResource (with transcript)', function () {
            [
                'd7bf1822-ec58-4a8e-a669-5cbcc0d6a1b2'
            ].forEach(contentId => {
                it(`should have a \`__doc:xmldom.Documnet\` for content_id="${contentId}"`, function () {
                    return underTest(contentId)
                        .then(content => {
                            expect(content.__doc.constructor.name).to.equal('Document');
                        });
                });

                it(`should have a \`transcript__CLEAN:String\` property for content_id="${contentId}"`, function () {
                    return underTest(contentId)
                        .then(content => {
                            expect(content).to.have.property('transcript__CLEAN')
                                .and.to.be.a('string');
                        });
                });

                it(`should have a \`transcript__PLAIN:String\` property for content_id="${contentId}"`, function () {
                    return underTest(contentId)
                        .then(content => {
                            expect(content).to.have.property('transcript__PLAIN')
                                .and.to.be.a('string');
                        });
                });

                describe(`should have a \`transcriptExtension:String\` based on the passed format for content_id="${contentId}"`, function () {
                    [
                        undefined,
                        'docx',
                        'text',
                        'html'
                    ].forEach(format => {
                        it(`format = ${format}`, function () {
                            let extension = DOWNLOAD_ARTICLE_FORMATS[format] || 'docx';

                            return underTest(contentId, format)
                                .then(content => {
                                    expect(content).to.have.property('transcriptExtension')
                                        .and.to.be.a('string')
                                        .and.equal(extension);
                                });
                        });
                    });
                });
            });
        });
    });

    describe.skip('fail', function () {
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
                    nock(BASE_URI_FT_API)
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
                        .then(content => {
                            expect(content).to.be.a('string');

                            expect(content).to.equal(message);
                        });
                });
            });
        });
    });
});
