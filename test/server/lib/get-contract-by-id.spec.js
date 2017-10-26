'use strict';

const path = require('path');

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const proxyquire = require('proxyquire');

const moment = require('moment');

const {
	TEST: { FIXTURES_DIRECTORY }
} = require('config');

const { expect } = chai;
chai.use(sinonChai);

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe(MODULE_ID, function () {
	describe('success', function () {
		let db;
		let underTest;

		const contractResponse = require(path.resolve(`${FIXTURES_DIRECTORY}/contractResponse.json`));

		let contract = require('../../../stubs/CA-00001558.json');

		const { initDB } = require(path.resolve(`${FIXTURES_DIRECTORY}/massive`))();

		before(async function () {
			db = initDB();

			db.syndication.upsert_contract.resolves([contractResponse]);
			db.syndication.get_contract_data.resolves([contractResponse]);

			underTest = proxyquire('../../../server/lib/get-contract-by-id', {
				'./get-salesforce-contract-by-id': sinon.stub().resolves(contract),
				'../../db/pg': sinon.stub().resolves(db)
			});
		});

		after(function () {
			underTest = null;
		});

		it('returns contract data', async function () {
			const res = await underTest('CA-00001558', { licence: { id: 'xyz' } });

			const expected = Object.assign(JSON.parse(JSON.stringify(contractResponse)), {
				content_allowed: 'Articles, Videos & Podcasts',
				contract_date: `${moment(contractResponse.start_date).format('DD/MM/YY')} - ${moment(contractResponse.end_date).format('DD/MM/YY')}`
			});

			expected.items[0] = expected.itemsMap['FT Article'] = expected.itemsMap['article'] = Object.assign(JSON.parse(JSON.stringify(expected.itemsMap['article'])), {
				current_downloads: {
					day: 0,
					month: 0,
					total: 0,
					week: 0,
					year: 0
				}
			});

			expected.items[1] = expected.itemsMap['Video'] = expected.itemsMap['video'] = Object.assign(JSON.parse(JSON.stringify(expected.itemsMap['video'])), {
				current_downloads: {
					day: 0,
					month: 0,
					total: 0,
					week: 0,
					year: 0
				}
			});

			expected.items[2] = expected.itemsMap['Podcast'] = expected.itemsMap['podcast'] = Object.assign(JSON.parse(JSON.stringify(expected.itemsMap['podcast'])), {
				current_downloads: {
					day: 0,
					month: 0,
					total: 0,
					week: 0,
					year: 0
				}
			});

			expect(res).to.eql(expected);
		});
	});
});
