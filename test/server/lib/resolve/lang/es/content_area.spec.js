'use strict';

/* eslint-disable */

const path = require('path');

const { expect } = require('chai');

const underTest = require('../../../../../../server/lib/resolve/lang/es/content_area');

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe(MODULE_ID, function () {
	it('returns its first argument', function() {
		expect(underTest('Spanish content')).to.equal('Spanish content');

		expect(underTest('Spanish weekend')).to.equal('Spanish weekend');
	});
});
