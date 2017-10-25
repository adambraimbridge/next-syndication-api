'use strict';

/* eslint-disable */

const path = require('path');

const { expect } = require('chai');

const underTest = require('../../../../../../server/lib/resolve/lang/es/lang');

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe(MODULE_ID, function () {
	it('returns `es`', function() {
		expect(underTest('es')).to.equal('es');

		expect(underTest('Spanish content')).to.equal('es');

		expect(underTest({})).to.equal('es');

		expect(underTest()).to.equal('es');
	});
});
