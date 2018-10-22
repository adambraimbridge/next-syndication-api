'use strict';

const path = require('path');

const { expect } = require('chai');

const underTest = require('../../../server/helpers/flag-is-on');

const MODULE_ID =
	path.relative(`${process.cwd()}/test`, module.id) ||
	require(path.resolve('./package.json')).name;

describe(MODULE_ID, function() {
	[true, 'on', 'ON', 'On'].forEach(state => {
		it(`returns true if the passed value is \`${state}\``, function() {
			expect(underTest(state)).to.be.true;
		});
	});

	[undefined, null, false, 'off', 'OFF', 'Off'].forEach(state => {
		it(`returns false if the passed value is \`${state}\``, function() {
			expect(underTest(state)).to.be.false;
		});
	});
});
