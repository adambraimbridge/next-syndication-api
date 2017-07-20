'use strict';

const path = require('path');

const { expect } = require('chai');

const underTest = require('../../../server/helpers/skip-checks');

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe(MODULE_ID, function () {
	describe('not-production', function() {
		[
			true,
			'on'
		].forEach(state => {
			it(`should return true when syndicationRedux === ${state}`, function () {
				expect(underTest({ syndicationRedux : state })).to.be.true;
			});
		});

		[
			false,
			'off'
		].forEach(state => {
			it(`should return false when syndicationRedux === ${state}`, function () {
				expect(underTest({ syndicationRedux : state })).to.be.false;
			});
		});
	});

	describe('production', function() {
		const NODE_ENV = process.env.NODE_ENV;

		after(function () {
			process.env.NODE_ENV = NODE_ENV;
		});

		before(function () {
			process.env.NODE_ENV = 'production';
		});

		[
			true,
			'on',
			false,
			'off'
		].forEach(state => {
			it(`should return false when syndicationRedux === ${state}`, function () {
				expect(underTest({ syndicationRedux : state })).to.be.false;
			});
		});
	});
});
