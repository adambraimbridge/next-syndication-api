'use strict';

/* eslint-disable */

const path = require('path');

const { expect } = require('chai');

const underTest = require('../../../../server/lib/resolve/messageCode');

const {
	TEST: { FIXTURES_DIRECTORY }
} = require('config');

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe(MODULE_ID, function () {
	const contractResponse = require(path.resolve(`${FIXTURES_DIRECTORY}/contractResponse.json`));
	const contributor_content = contractResponse.contributor_content;

	before(function () {
		contractResponse.contributor_content = true;
	});

	after(function () {
		contractResponse.contributor_content = contributor_content;
	});

	const messageItemMap = {
		MSG_2000: { canBeSyndicated: 'yes', downloaded: false, canDownload: 1 },
		MSG_2100: { canBeSyndicated: 'yes', downloaded: true },
		MSG_2200: { canBeSyndicated: 'verify', canDownload: -1 },
//		MSG_2300: { canBeSyndicated: 'withContributorPayment' },
		MSG_2320: { canBeSyndicated: 'withContributorPayment', downloaded: false },
		MSG_2340: { canBeSyndicated: 'withContributorPayment', downloaded: true },
		MSG_4000: { canBeSyndicated: 'no' },
		MSG_4100: { canDownload: -1 },
		MSG_4200: { canDownload: 0, lang: 'en' },
		MSG_4250: { canDownload: 0, lang: 'es' },
		MSG_5000: {}
	};

	for (let [code, item] of Object.entries(messageItemMap)) {
		it(`message code: ${code}`, function () {
			expect(underTest(item, contractResponse)).to.equal(code);
		});
	}

	it(`message code: MSG_2300`, function () {
		contractResponse.contributor_content = false;

		expect(underTest({ canBeSyndicated: 'withContributorPayment' }, contractResponse)).to.equal('MSG_2300');
	});
});
