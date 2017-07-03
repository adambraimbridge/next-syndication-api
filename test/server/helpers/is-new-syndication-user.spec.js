'use strict';

const path = require('path');

const { expect } = require('chai');

const underTest = require('../../../server/helpers/is-new-syndication-user');

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe(MODULE_ID, function () {
	it('returns true if the `syndicationNew` flag is on', function() {
		expect(underTest({
			syndicationNew: 'on'
		})).to.be.true;
	});

	it('returns false if the `syndicationNew` flag is off', function() {
		expect(underTest({
			syndicationNew: false
		})).to.be.false;
	});

	it('returns false if no flags object is passed', function() {
		expect(underTest()).to.be.false;
	});
});
