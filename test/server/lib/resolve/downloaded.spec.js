'use strict';

/* eslint-disable */

const path = require('path');

const { expect } = require('chai');

const underTest = require('../../../../server/lib/resolve/downloaded');

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe(MODULE_ID, function () {
	it('returns false', function() {
		expect(underTest(undefined)).to.be.false;
	});

	it('returns false', function() {
		expect(underTest(undefined, 'downloaded', null, { item_state: 'interrupted' })).to.be.false;
	});

	it('returns true', function() {
		expect(underTest(undefined, 'downloaded', null, { item_state: 'complete' })).to.be.true;
	});

	it('returns true', function() {
		expect(underTest(undefined, 'downloaded', null, { item_state: 'start' })).to.be.true;
	});
});
