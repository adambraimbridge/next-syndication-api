'use strict';

/* eslint-disable */

const path = require('path');

const { expect } = require('chai');

const underTest = require('../../../../server/lib/resolve/publishedDate');

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe(MODULE_ID, function () {
	it('returns its first argument', function() {
		expect(underTest('2017-06-19T12:47:54.753Z')).to.equal('2017-06-19T12:47:54.753Z');
	});
});
