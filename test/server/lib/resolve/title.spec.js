'use strict';

/* eslint-disable */

const path = require('path');

const { expect } = require('chai');

const underTest = require('../../../../server/lib/resolve/title');

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe(MODULE_ID, function () {
	it('returns its first argument', function() {
		expect(underTest('FT View: Brexit rethink required')).to.equal('FT View: Brexit rethink required');
	});
});
