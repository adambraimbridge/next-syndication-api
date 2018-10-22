'use strict';

const path = require('path');

const { expect } = require('chai');

const mime = require('mime-types');

const underTest = require('../../../../server/lib/enrich/podcast');

const {
	DOWNLOAD_ARCHIVE_EXTENSION,
	DOWNLOAD_FILENAME_PREFIX,
	DOWNLOAD_MEDIA_TYPES,
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

			it('extension', function() {
				expect(item.extension).to.equal(DOWNLOAD_ARCHIVE_EXTENSION);
			});

			it('fileName', function() {
				expect(item.fileName).to.equal(
					`${DOWNLOAD_FILENAME_PREFIX}${item.title
						.replace(RE_SPACE, '_')
						.replace(RE_BAD_CHARS, '')
						.substring(0, 12)}`
				);
			});

			if (item.document) {
				it('document', function() {
					expect(item.document.constructor.name).to.equal('Document');
				});

				it('transcriptExtension', function() {
					expect(item.transcriptExtension).to.equal(DEFAULT_FORMAT);
				});

				it('hasTranscript', function() {
					expect(item.hasTranscript).to.be.a('boolean').and.be.true;
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
			} else {
				it('hasTranscript', function() {
					expect(item.hasTranscript).to.be.a('boolean').and.be.false;
				});
			}

			describe('download', function() {
				it('mediaType', function() {
					expect(item.download)
						.to.be.a('object')
						.and.have.property('mediaType')
						.and.to.be.a('string')
						.and.to.equal(DOWNLOAD_MEDIA_TYPES.podcast);
				});

				it('url', function() {
					expect(item.download)
						.to.be.a('object')
						.and.have.property('url')
						.and.to.be.a('string');
				});

				it('extension', function() {
					expect(item.download)
						.to.be.a('object')
						.and.have.property('extension')
						.and.to.be.a('string')
						.and.to.equal(mime.extension(item.download.mediaType));
				});
			});

			if (item.captions.length) {
				describe('captions', function() {
					it('captions', function() {
						expect(item.captions)
							.to.be.an('array')
							.and.have.property('length')
							.and.to.be.at.least(1);
					});

					it('captions[0].mediatType', function() {
						expect(item.captions[0])
							.to.be.a('object')
							.and.have.property('mediaType')
							.and.to.be.a('string')
							.and.to.equal(DOWNLOAD_MEDIA_TYPES.caption);
					});

					it('captions[0].url', function() {
						expect(item.download)
							.to.be.a('object')
							.and.have.property('url')
							.and.to.be.a('string');
					});
				});
			} else {
				describe('captions', function() {
					it('captions', function() {
						expect(item.captions)
							.to.be.an('array')
							.and.have.property('length')
							.and.to.equal(0);
					});
				});
			}
		});
	});
});
