'use strict';

const path = require('path');

const { expect } = require('chai');

const mime = require('mime-types');

const underTest = require('../../../../server/lib/enrich/index');

const {
	DOWNLOAD_FILENAME_PREFIX,
	TEST: { FIXTURES_DIRECTORY },
} = require('config');

const RE_BAD_CHARS = /[^A-Za-z0-9_]/gm;
const RE_SPACE = /\s/gm;

const MODULE_ID =
	path.relative(`${process.cwd()}/test`, module.id) ||
	require(path.resolve('./package.json')).name;

describe(MODULE_ID, function() {
	const DEFAULT_FORMAT = 'docx';

	[
		'42ad255a-99f9-11e7-b83c-9588e51488a0',
		'ef4c49fe-980e-11e7-b83c-9588e51488a0',
		'b16fce7e-3c92-48a3-ace0-d1af3fce71af',
		'a1af0574-eafb-41bd-aa4f-59aa2cd084c2',
		'98b46b5f-17d3-40c2-8eaa-082df70c5f01',
		'93991a3c-0436-41bb-863e-61242e09859c',
	].forEach(content_id => {
		const item = require(path.resolve(
			`${FIXTURES_DIRECTORY}/content/${content_id}.json`
		));

		underTest(item, DEFAULT_FORMAT);

		describe(`${item.type}: ${item.id}`, function() {
			it('content_id', function() {
				expect(item.content_id).to.equal(item.id);
			});

			it('content_type', function() {
				expect(item.content_type).to.equal(item.type);
			});

			it('fileName', function() {
				expect(item.fileName).to.equal(
					`${DOWNLOAD_FILENAME_PREFIX}${item.title
						.replace(RE_SPACE, '_')
						.replace(RE_BAD_CHARS, '')
						.substring(0, 12)}`
				);
			});

			if (item.bodyHTML) {
				it('document', function() {
					expect(item.document.constructor.name).to.equal('Document');
				});

				it('wordCount', function() {
					expect(item.wordCount).to.be.a('number');
				});

				it('bodyHTML__CLEAN', function() {
					expect(item.bodyHTML__CLEAN).to.be.a('string');
				});

				it('bodyHTML__PLAIN', function() {
					expect(item.bodyHTML__PLAIN).to.be.a('string');
				});

				if (item.type !== 'article') {
					it('hasTranscript', function() {
						expect(item.hasTranscript).to.be.true;
					});
				}
			}

			if (item.attachments) {
				it('download', function() {
					expect(item.download).to.be.an('object');
				});

				it('download.extension', function() {
					expect(item.download.extension).to.equal(
						mime.extension(item.download.mediaType)
					);
				});
			}
		});
	});
});
