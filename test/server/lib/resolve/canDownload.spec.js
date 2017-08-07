'use strict';

/* eslint-disable */

const path = require('path');

const { expect } = require('chai');

const underTest = require('../../../../server/lib/resolve/canDownload');

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe.only(MODULE_ID, function () {
	it('returns 0', function() {
		expect(underTest(undefined, 'canDownload', { item_state: 'interrupted', type: 'http://www.ft.com/ontology/content/Video' })).to.equal(0);
	});

	it('returns 0', function() {
		expect(underTest(undefined, 'canDownload', { type: 'http://www.ft.com/ontology/content/Video' }, null, { limits: { article: 10 } })).to.equal(0);
	});

	it('returns 1', function() {
		expect(underTest(undefined, 'canDownload', { type: 'http://www.ft.com/ontology/content/Video' }, { item_state: 'complete' })).to.equal(1);
	});

	it('returns 1', function() {
		expect(underTest(undefined, 'canDownload', { type: 'http://www.ft.com/ontology/content/Video' }, { item_state: 'start' })).to.equal(1);
	});

	it('returns 1', function() {
		expect(underTest(undefined, 'canDownload', { type: 'http://www.ft.com/ontology/content/Article' }, null, { download_count: { remaining: { article: 2 } }, limits: { article: 10 } })).to.equal(1);
	});

	it('returns 1', function() {
		expect(underTest(undefined, 'canDownload', { type: 'http://www.ft.com/ontology/content/Video' }, null, { download_count: { remaining: { article: 2, video: 2 } }, limits: { article: 10, video: 10 } })).to.equal(1);
	});
});
