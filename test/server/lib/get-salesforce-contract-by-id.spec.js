'use strict';

const path = require('path');

const chai = require('chai');
const nock = require('nock');

const {
	TEST: { FIXTURES_DIRECTORY }
} = require('config');

const underTest = require('../../../server/lib/get-salesforce-contract-by-id');

const { expect } = chai;

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe(MODULE_ID, function () {
	before(async function () {
		nock('https://login.salesforce.com')
			.post('/services/oauth2/token')
			.reply(() => {
				return [
					200,
					{
						access_token: '00DL....z_pH',
						instance_url: 'https://financialtimes--test.cs8.my.salesforce.com',
						id: 'https://login.salesforce.com/id/00D...MAM/005...IAO',
						token_type: 'Bearer',
						issued_at: '1500301959088',
						signature: 'dL6R....rgA='
					}
				];
			});

		nock('https://financialtimes--test.cs8.my.salesforce.com')
			.get('/services/apexrest/SCRMContract/FTS-14046740')
			.reply(() => {
				return [
					200,
					require(path.resolve(`${FIXTURES_DIRECTORY}/contractProfile.json`)),
					{}
				];
			});
	});

	it('returns contract data', async function () {
		const item = await underTest('FTS-14046740');

		expect(item).to.eql(require(path.resolve(`${FIXTURES_DIRECTORY}/contractProfile.json`)));
	});
});
