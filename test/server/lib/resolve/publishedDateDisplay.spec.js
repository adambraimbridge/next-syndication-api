'use strict';

/* eslint-disable */

const path = require('path');

const { expect } = require('chai');

const {
	MESSAGES: { DATE_FORMAT },
} = require('config');

const underTest = require('../../../../server/lib/resolve/publishedDateDisplay');

const MODULE_ID =
	path.relative(`${process.cwd()}/test`, module.id) ||
	require(path.resolve('./package.json')).name;

describe(MODULE_ID, function() {
	it(`returns the firstPublishedDate formatted as ${DATE_FORMAT}`, function() {
		expect(
			underTest(null, null, { firstPublishedDate: '2017-06-19T12:47:54.753Z' })
		).to.equal('19th Jun 2017');
	});

	it(`returns the publishedDate formatted as ${DATE_FORMAT}`, function() {
		expect(
			underTest(null, null, { publishedDate: '2017-06-19T12:47:54.753Z' })
		).to.equal('19th Jun 2017');
	});
});
