'use strict';

/* eslint-disable */

const path = require('path');

const { expect } = require('chai');

const underTest = require('../../../../server/lib/resolve/canBeSyndicated');

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe(MODULE_ID, function () {
	it('returns its first argument', function() {
		expect(underTest('yes')).to.equal('yes');

		expect(underTest('no')).to.equal('no');

		expect(underTest('verify')).to.equal('verify');

		expect(underTest(null)).to.equal(null);

		expect(underTest('null')).to.equal('null');
	});
});
