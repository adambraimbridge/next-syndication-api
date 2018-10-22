'use strict';

/* eslint-disable */

const path = require('path');

const { expect } = require('chai');

const underTest = require('../../../../../../server/lib/resolve/lang/es/translatedDate');

const MODULE_ID =
	path.relative(`${process.cwd()}/test`, module.id) ||
	require(path.resolve('./package.json')).name;

describe(MODULE_ID, function() {
	it('returns the value of `translated_date`', function() {
		const date = new Date();

		expect(
			underTest(undefined, 'translatedDate', { translated_date: date })
		).to.equal(date);
	});
});
