'use strict';

/* eslint-disable */

const path = require('path');

const { expect } = require('chai');

const underTest = require('../../../../../../server/lib/resolve/lang/es/canBeSyndicated');

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe(MODULE_ID, function () {
	it('returns `yes`', function() {
		expect(underTest('yes', 'canBeSyndicated', { content_area: 'Spanish content' }, {}, { allowed: { spanish_content: true }})).to.equal('yes');

		expect(underTest('yes', 'canBeSyndicated', {}, { content_area: 'Spanish weekend' }, { allowed: { spanish_weekend: true }})).to.equal('yes');
	});

	it('returns `verify`', function() {
		expect(underTest('yes', 'canBeSyndicated', { content_area: 'Spanish content' }, {}, { allowed: { spanish_weekend: true }})).to.equal('verify');

		expect(underTest('yes', 'canBeSyndicated', {}, { content_area: 'Spanish weekend' }, { allowed: { spanish_content: true }})).to.equal('verify');
	});
});
