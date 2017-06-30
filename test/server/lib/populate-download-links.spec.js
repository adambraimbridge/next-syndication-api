'use strict';

const path = require('path');

const { expect } = require('chai');
const populateDownloadLinks = require('../../../server/lib/populate-download-links');

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe(MODULE_ID, function () {
	it('should populate content objects with an array of download links', function () {
		const populatedLinks = populateDownloadLinks({ uuid: '123' });

		expect(populatedLinks.links).to.be.an('array');
	});

	describe('Link array objects', function () {
		it('should contain a `format` string', function () {
			const populatedLinks = populateDownloadLinks({ uuid: '123' });

			expect(populatedLinks.links[0].format).to.be.a('string');
		});

		it('should contain a `url` string', function () {
			const populatedLinks = populateDownloadLinks({ uuid: '123' });

			expect(populatedLinks.links[0].url).to.be.a('string');
		});

	});
});
