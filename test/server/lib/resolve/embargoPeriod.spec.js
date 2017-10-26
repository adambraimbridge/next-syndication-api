'use strict';

/* eslint-disable */

const path = require('path');

const { expect } = require('chai');

const moment = require('moment');

const underTest = require('../../../../server/lib/resolve/embargoPeriod');

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe(MODULE_ID, function () {
	it('returns null', function() {
		expect(underTest(undefined, 'embargoPeriod', { publishedDate: moment().subtract(12, 'days').toJSON(), content_type: 'video' }, null, { itemsMap: { video: { embargo_period: 10 } } })).to.equal(null);
	});

	it('returns null', function() {
		expect(underTest(undefined, 'embargoPeriod', { firstPublishedDate: moment().toJSON(), content_type: 'video' }, null, { itemsMap: { article: { download_limit: 10 } } })).to.equal(null);
	});

	it('returns 10', function() {
		expect(underTest(undefined, 'embargoPeriod', { firstPublishedDate: moment().subtract(8, 'days').toJSON(), content_type: 'video' }, null, { itemsMap: { video: { embargo_period: 10 } } })).to.equal(10);
	});

	it('returns 10', function() {
		expect(underTest(undefined, 'embargoPeriod', { publishedDate: moment().toJSON(), content_type: 'video' }, null, { itemsMap: { video: { embargo_period: 10 } } })).to.equal(10);
	});
});
