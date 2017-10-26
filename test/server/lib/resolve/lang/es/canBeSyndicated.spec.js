'use strict';

/* eslint-disable */

const path = require('path');

const { expect } = require('chai');

const underTest = require('../../../../../../server/lib/resolve/lang/es/canBeSyndicated');

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe(MODULE_ID, function () {
	it('returns `yes`', function() {
		expect(underTest('yes')).to.equal('yes');

		expect(underTest('Spanish content')).to.equal('yes');

		expect(underTest({})).to.equal('yes');

		expect(underTest()).to.equal('yes');
	});
});
