'use strict';

const path = require('path');

const { expect } = require('chai');
const proxyquire = require('proxyquire');

const mime = require('mime-types');

const {
	DOWNLOAD_ARCHIVE_EXTENSION,
	DOWNLOAD_ARTICLE_FORMATS,
//    DOWNLOAD_ARTICLE_EXTENSION_OVERRIDES,
	DOWNLOAD_FILENAME_PREFIX,
	DOWNLOAD_MEDIA_TYPES,
	TEST: { FIXTURES_DIRECTORY }
} = require('config');

const RE_BAD_CHARS = /[^A-Za-z0-9_]/gm;
const RE_SPACE = /\s/gm;
//const RE_VALID_URI = /^\/content\/([A-Za-z0-9]{8}(?:-[A-Za-z0-9]{4}){3}-[A-Za-z0-9]{12})$/;

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe(MODULE_ID, function () {

	const esClient  = require(path.resolve(`${FIXTURES_DIRECTORY}/n-es-client`));

	let underTest;

	before(function () {
	});

	after(function () {
	});

	describe('success', function () {
		beforeEach(function () {
			underTest = proxyquire('../../../server/lib/get-content-by-id', {
				'@financial-times/n-es-client': esClient,
				'@noCallThru': true
			});
		});

		describe('type: Article', function () {
			[
				'42ad255a-99f9-11e7-b83c-9588e51488a0',
				'ef4c49fe-980e-11e7-b83c-9588e51488a0'
			].forEach(contentId => {
				it(`should return a JSON representation of the content if it exists for content_id="${contentId}"`, async function () {
					const content = await underTest(contentId);

					expect(content).to.be.an('object');

					expect(content).to.have.property('id')
						.and.to.have.string(contentId);
				});

				it(`should have a \`document:xmldom.Documnet\` for content_id="${contentId}"`, async function () {
					const content = await underTest(contentId);

					expect(content.document.constructor.name).to.equal('Document');
				});

				it(`should have a \`wordCount:Number\` for content_id="${contentId}"`, async function () {
					const content = await underTest(contentId);

					expect(content).to.have.property('wordCount')
						.and.to.be.a('number');
				});

				it(`should have a \`bodyHTML__CLEAN:String\` for content_id="${contentId}"`, async function () {
					const content = await underTest(contentId);

					expect(content).to.have.property('bodyHTML__CLEAN')
						.and.to.be.a('string');
				});

				describe(`should have a \`extension:String\` based on the passed format for content_id="${contentId}"`, function () {
					[
						undefined,
						'docx',
						'text',
						'html'
					].forEach(format => {
						it(`format = ${format}`, async function () {
							let extension = DOWNLOAD_ARTICLE_FORMATS[format] || 'docx';

							const content = await underTest(contentId, format);

							expect(content).to.have.property('extension')
								.and.to.be.a('string')
								.and.equal(extension);
						});
					});
				});

				it(`should have a \`fileName:String\` for content_id="${contentId}"`, async function () {
					const content = await underTest(contentId);

					expect(content).to.have.property('fileName')
						.and.to.be.a('string')
						.and.to.equal(DOWNLOAD_FILENAME_PREFIX + content.title.replace(RE_SPACE, '_').replace(RE_BAD_CHARS, '').substring(0, 12));
				});
			});
		});

		describe('type: MediaResource', function () {
			[
				'b16fce7e-3c92-48a3-ace0-d1af3fce71af',
				'a1af0574-eafb-41bd-aa4f-59aa2cd084c2',
				'98b46b5f-17d3-40c2-8eaa-082df70c5f01',
				'93991a3c-0436-41bb-863e-61242e09859c'
			].forEach(contentId => {
				it(`should return a JSON representation of the content if it exists for content_id="${contentId}"`, async function () {
					const content = await underTest(contentId);

					expect(content).to.be.an('object');

					expect(content).to.have.property('id')
						.and.to.have.string(contentId);
				});

				it(`should have a \`attachments:Array\` for content_id="${contentId}"`, async function () {
					const content = await underTest(contentId);

					expect(content).to.have.property('attachments')
						.and.to.be.an('array')
						.and.to.have.length.at.least(1);
				});

				it(`should have a \`extension:String\` which is an Archive format for content_id="${contentId}"`, async function () {
					const content = await underTest(contentId);

					expect(content).to.have.property('extension')
						.and.to.be.a('string')
						.and.equal(DOWNLOAD_ARCHIVE_EXTENSION);
				});

				it(`should have a \`download:Object\` which is the final item in the \`attachments:Array\` for content_id="${contentId}"`, async function () {
					const content = await underTest(contentId);

					expect(content).to.have.property('download')
						.and.to.be.an('object')
						.and.equal(Array.from(content.attachments).reverse().find(item => item.mediaType === DOWNLOAD_MEDIA_TYPES.podcast || item.mediaType === DOWNLOAD_MEDIA_TYPES.video));
				});

				it(`should have a \`download.extension:Object\` based on the \`mediaType\` for content_id="${contentId}"`, async function () {
					const content = await underTest(contentId);

					expect(content.download).to.have.property('extension')
						.and.to.equal(mime.extension(content.download.mediaType));
				});

				it(`should have a \`fileName:String\` for content_id="${contentId}"`, async function () {
					const content = await underTest(contentId);

					expect(content).to.have.property('fileName')
						.and.to.be.a('string')
						.and.to.equal(DOWNLOAD_FILENAME_PREFIX + content.title.replace(RE_SPACE, '_').replace(RE_BAD_CHARS, '').substring(0, 12));
				});
			});
		});

		describe('type: MediaResource (with transcript)', function () {
			[
				'b16fce7e-3c92-48a3-ace0-d1af3fce71af',
				'a1af0574-eafb-41bd-aa4f-59aa2cd084c2',
				'98b46b5f-17d3-40c2-8eaa-082df70c5f01',
				'93991a3c-0436-41bb-863e-61242e09859c'
			].forEach(contentId => {
				it(`should have a \`document:xmldom.Documnet\` for content_id="${contentId}"`, async function () {
					const content = await underTest(contentId);

					expect(content.document.constructor.name).to.equal('Document');
				});

				it(`should have a \`bodyHTML__CLEAN:String\` property for content_id="${contentId}"`, async function () {
					const content = await underTest(contentId);

					expect(content).to.have.property('bodyHTML__CLEAN')
						.and.to.be.a('string');
				});

				it(`should have a \`bodyHTML__PLAIN:String\` property for content_id="${contentId}"`, async function () {
					const content = await underTest(contentId);

					expect(content).to.have.property('bodyHTML__PLAIN')
						.and.to.be.a('string');
				});

				describe(`should have a \`transcriptExtension:String\` based on the passed format for content_id="${contentId}"`, function () {
					[
						undefined,
						'docx',
						'text',
						'html'
					].forEach(format => {
						it(`format = ${format}`, async function () {
							let extension = DOWNLOAD_ARTICLE_FORMATS[format] || 'docx';

							const content = await underTest(contentId, format);

							expect(content).to.have.property('transcriptExtension')
								.and.to.be.a('string')
								.and.equal(extension);
						});
					});
				});
			});
		});
	});

/*
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

				it('should return the error if the content does not exist', async function () {
					const content = await underTest(contentId);

					expect(content).to.be.a('string');

					expect(content).to.equal(message);
				});
			});
		});
	});
	*/
});
