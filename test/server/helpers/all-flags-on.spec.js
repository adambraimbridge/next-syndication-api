'use strict';

const path = require('path');

const { expect } = require('chai');

const underTest = require('../../../server/helpers/all-flags-on');

const MODULE_ID =
	path.relative(`${process.cwd()}/test`, module.id) ||
	require(path.resolve('./package.json')).name;

describe(MODULE_ID, function() {
	const flags = {
		flag1: 'on',
		flag2: 'off',
		flag3: 'on',
		flag4: 'off',
		flag5: 'on',
		flag6: 'off',
		flag7: 'on',
		flag8: 'off',
		flag9: 'on',
	};

	it('returns true if all flags being checked are "on"', function() {
		expect(underTest(flags, 'flag7')).to.be.true;

		expect(
			underTest(flags, 'flag1', 'flag3', 'flag5', 'flag7', 'flag9')
		).to.be.true;
	});

	it('returns false if any of the flags being checked are not "on"', function() {
		expect(underTest(flags, 'flag2')).to.be.false;

		expect(
			underTest(flags, 'flag2', 'flag3', 'flag5', 'flag7', 'flag8')
		).to.be.false;

		expect(
			underTest(flags, 'flag1', 'flag3', 'flag4', 'flag7', 'flag8')
		).to.be.false;

		expect(
			underTest(flags, 'flag1', 'flag3', 'flag5', 'flag7', 'flag8')
		).to.be.false;
	});
});
