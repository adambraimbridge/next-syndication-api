'use strict';

/* eslint-disable */

const path = require('path');

const { expect } = require('chai');

const underTest = require('../../../../../../server/lib/resolve/lang/es/byline');

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe(MODULE_ID, function () {
	it('returns its first argument', function() {
		expect(underTest('Aime Williams')).to.equal('Aime Williams');

		expect(underTest('Gillian Tett')).to.equal('Gillian Tett');
	});
});
