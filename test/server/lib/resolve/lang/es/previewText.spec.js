'use strict';

/* eslint-disable */

const path = require('path');

const { expect } = require('chai');

const {
	TEST: {
		FIXTURES_DIRECTORY
	}
} = require('config');

const enrich = require('../../../../../../server/lib/enrich');

const underTest = require('../../../../../../server/lib/resolve/lang/es/previewText');

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe.skip(MODULE_ID, function () {
	it('returns the first paragraph if it is <= 105 characters', function() {
		const content = require(path.resolve(`${FIXTURES_DIRECTORY}/content/es/52be3c0c-7831-11e7-a3e8-60495fe6ca71.json`));

		enrich(content);

		expect(underTest(undefined, 'previewText', content)).to.equal(content.document.childNodes[0].childNodes[1].textContent);
	});

	it('returns the first 105 characters of the first paragraph truncated with `...` > 105 characters', function() {
		const content = require(path.resolve(`${FIXTURES_DIRECTORY}/content/es/b6e54ea4-86c4-11e7-8bb1-5ba57d47eff7.json`));

		enrich(content);

		expect(underTest(undefined, 'previewText', content)).to.equal(content.document.childNodes[0].childNodes[1].textContent.substring(0, 105) + '...');
	});
});
