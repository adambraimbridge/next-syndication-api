'use strict';

/* eslint-disable */

const path = require('path');

const { expect } = require('chai');

const moment = require('moment');

const {
	MESSAGES: { DATE_FORMAT },
} = require('config');

const underTest = require('../../../../../../server/lib/resolve/lang/es/translatedDateDisplay');

const MODULE_ID =
	path.relative(`${process.cwd()}/test`, module.id) ||
	require(path.resolve('./package.json')).name;

describe(MODULE_ID, function() {
	it(`returns the value of \`translated_date\` formatted as ${DATE_FORMAT}`, function() {
		const date = new Date();

		expect(
			underTest(undefined, 'translatedDateDisplay', { translated_date: date })
		).to.equal(moment(date).format(DATE_FORMAT));
	});
});
