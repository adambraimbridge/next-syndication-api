'use strict';

const path = require('path');

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const proxyquire = require('proxyquire');

const moment = require('moment');

const { db, client } = require('../../../db/connect');

const { expect } = chai;
chai.use(sinonChai);

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe(MODULE_ID, function () {
	describe('success', function () {
		let underTest;

		const contractResponse = {
			'owner_email': 'syndication@ft.com',
			'last_updated': '2017-07-19T13:37:20.291Z',
			'owner_name': 'FT Syndication',
			'contract_date': '11/12/15 - 31/01/50',
			'contract_starts': '2015-12-11',
			'limit_podcast': 10000000,
			'contract_ends': '2050-01-31',
			'contributor_content': true,
			'limit_video': 10000000,
			'licencee_name': 'FT Staff',
			'content_allowed': 'Articles, Podcasts & Video',
			'assets': [{
				'online_usage_limit': 10000000,
				'product': 'FT Article',
				'online_usage_period': 'Week',
				'print_usage_period': 'Week',
				'print_usage_limit': 20,
				'embargo_period': 0,
				'asset': 'FT Article',
				'content': 'FT.com'
			}, {
				'online_usage_limit': 10000000,
				'product': 'Video',
				'online_usage_period': 'Week',
				'print_usage_period': 'Week',
				'print_usage_limit': 20,
				'embargo_period': 0,
				'asset': 'Video',
				'content': 'FT.com'
			}, {
				'online_usage_limit': 10000000,
				'product': 'Podcast',
				'online_usage_period': 'Week',
				'print_usage_period': 'Week',
				'print_usage_limit': 20,
				'embargo_period': 0,
				'asset': 'Podcast',
				'content': 'FT.com'
			}],
			'contract_number': 'CA-00001558',
			'client_website': 'https://www.ft.com',
			'client_publications': 'FT',
			'limit_article': 10000000
		};

		let contract = require('../../../stubs/CA-00001558.json');

		before(async function () {
			sinon.stub(client, 'getAsync').resolves({ Item: contractResponse });
			sinon.stub(db, 'putItemAsync').resolves({});

			underTest = proxyquire('../../../server/lib/get-contract-by-id', {
				'./get-salesforce-contract-by-id': sinon.stub().resolves(contract)
			});
		});

		after(function () {
			underTest = null;

			db.putItemAsync.restore();
		});

		it('returns contract data', async function () {
			const res = await underTest('CA-00001558');

			expect(res).to.eql(Object.assign(JSON.parse(JSON.stringify(contractResponse)), {
				content_allowed: 'Articles, Podcasts & Video',
				contract_date: `${moment(contractResponse.contract_starts).format('DD/MM/YY')} - ${moment(contractResponse.contract_ends).format('DD/MM/YY')}`
			}));
		});
	});
});
