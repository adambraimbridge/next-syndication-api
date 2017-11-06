'use strict';

/* eslint-disable */

const path = require('path');

const { expect } = require('chai');

const underTest = require('../../../../server/lib/resolve/canBeSyndicated');

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe(MODULE_ID, function () {
	describe('if `content.type` is not equal to `podcast`', function () {
		it('returns its first argument', function() {
			expect(underTest('yes', 'canBeSyndicated', { content_type: 'article' })).to.equal('yes');

			expect(underTest('no', 'canBeSyndicated', { content_type: 'video' })).to.equal('no');

			expect(underTest('verify', 'canBeSyndicated', { content_type: 'article' })).to.equal('verify');

			expect(underTest(null, 'canBeSyndicated', { content_type: 'video' })).to.equal(null);

			expect(underTest('null', 'canBeSyndicated', { content_type: 'article' })).to.equal('null');
		});
	});

	describe('if `content.type` is equal to `podcast`', function () {
		describe('if the contract can NOT download podcasts', function() {
			it('returns its first argument', function() {
				expect(underTest('yes', 'canBeSyndicated', { content_type: 'podcast'}, {}, { itemsMap: { podcast: { download_limit: 0 } } })).to.equal('yes');

				expect(underTest('no', 'canBeSyndicated', { content_type: 'podcast'}, {}, { itemsMap: { } })).to.equal('no');

				expect(underTest('verify', 'canBeSyndicated', { content_type: 'podcast'}, {}, { itemsMap: { podcast: { download_limit: 0 } } })).to.equal('verify');

				expect(underTest(null, 'canBeSyndicated', { content_type: 'podcast'}, {}, { itemsMap: { } })).to.equal(null);

				expect(underTest('null', 'canBeSyndicated', { content_type: 'podcast'}, {}, { itemsMap: { podcast: { download_limit: 0 } } })).to.equal('null');
			});
		});

		describe('if the contract can download podcasts', function() {
			it('returns `yes`', function() {
				expect(underTest('yes', 'canBeSyndicated', { content_type: 'podcast'}, {}, { itemsMap: { podcast: { download_limit: 1 } } })).to.equal('yes');

				expect(underTest('no', 'canBeSyndicated', { content_type: 'podcast'}, {}, { itemsMap: { podcast: { download_limit: 10 } } })).to.equal('yes');

				expect(underTest('verify', 'canBeSyndicated', { content_type: 'podcast'}, {}, { itemsMap: { podcast: { download_limit: 100 } } })).to.equal('yes');

				expect(underTest(null, 'canBeSyndicated', { content_type: 'podcast'}, {}, { itemsMap: { podcast: { download_limit: 32 } } })).to.equal('yes');

				expect(underTest('null', 'canBeSyndicated', { content_type: 'podcast'}, {}, { itemsMap: { podcast: { download_limit: 64 } } })).to.equal('yes');
			});
		});
	});
});
