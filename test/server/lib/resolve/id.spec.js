'use strict';

/* eslint-disable */

const path = require('path');

const { expect } = require('chai');

const underTest = require('../../../../server/lib/resolve/id');

const MODULE_ID =
	path.relative(`${process.cwd()}/test`, module.id) ||
	require(path.resolve('./package.json')).name;

describe(MODULE_ID, function() {
	it('returns the content ID of the passed URI', function() {
		expect(
			underTest('http://www.ft.com/thing/80d634ea-fa2b-46b5-886f-1418c6445182')
		).to.equal('80d634ea-fa2b-46b5-886f-1418c6445182');
	});
});
