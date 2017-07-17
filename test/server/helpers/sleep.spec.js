'use strict';

const path = require('path');

const { expect } = require('chai');

const underTest = require('../../../server/helpers/sleep');

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe(MODULE_ID, function () {
	it('should wait the default 250ms before continuing', async function () {
		const start = Date.now();

		await underTest();

		expect(Date.now() - start).to.be.at.least(250);
	});

	it('should wait the passed number of ms before continuing (less than default)', async function () {
		const start = Date.now();

		await underTest(50);

		expect(Date.now() - start).to.be.at.within(50, 100);
	});

	it('should wait the passed number of ms before continuing (greater than default)', async function () {
		const start = Date.now();

		await underTest(500);

		expect(Date.now() - start).to.be.at.within(500, 550);
	});
});
