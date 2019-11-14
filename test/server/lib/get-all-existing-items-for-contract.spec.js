'use strict';

const path = require('path');

const chai = require('chai');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

const {
	TEST: { FIXTURES_DIRECTORY }
} = require('config');

const { expect } = chai;
chai.use(sinonChai);

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe(MODULE_ID, function () {
	const { initDB } = require(path.resolve(`${FIXTURES_DIRECTORY}/massive`))();

	const contractResponse = require(path.resolve(`${FIXTURES_DIRECTORY}/contractResponse.json`));

	let db;
	let underTest;

	let downloadedItems = [{
		'_id': '095ffdbf50ee4041ee18ed9077216844',
		'contract_id': 'FTS-14029674',
		'asset_type': 'FT Article',
		'user_id': '8ef593a8-eef6-448c-8560-9ca8cdca80a5',
		'content_id': 'http://www.ft.com/thing/02c03200-86dc-11e7-bf50-e1c239b45787',
		'time': '2017-08-22T13:32:49.226Z',
		'download_format': 'docx',
		'state': 'complete',
		'user_name': 'christos constandinou',
		'user_email': 'christos.constandinou@ft.com',
		'content_type': 'article',
		'title': 'Donald Trump warns against hasty withdrawal from Afghanistan ',
		'published_date': '2017-08-22T01:58:37.000Z',
		'syndication_state': 'yes',
		'last_modified': '2017-08-22T13:32:50.177Z',
		'id': '02c03200-86dc-11e7-bf50-e1c239b45787',
		'date': '22 August 2017',
		'published': '22 August 2017'
	}, {
		'_id': '6feabf0d4eed16682bfbd6d3560a45ee',
		'contract_id': 'FTS-14029674',
		'asset_type': 'FT Article',
		'user_id': 'b2697f93-52d3-4d42-8409-bdf91b09e894',
		'content_id': 'http://www.ft.com/thing/491cf75e-51d2-11e7-a1f2-db19572361bb',
		'time': '2017-08-22T12:35:10.751Z',
		'download_format': 'plain',
		'state': 'complete',
		'user_name': 'James Wise',
		'user_email': 'james.wise@ft.com',
		'content_type': 'article',
		'title': 'Business school: advisory councils and business book competition',
		'published_date': '2017-08-21T11:07:37.000Z',
		'syndication_state': 'yes',
		'last_modified': '2017-08-22T12:35:11.895Z',
		'id': '491cf75e-51d2-11e7-a1f2-db19572361bb',
		'date': '22 August 2017',
		'published': '21 August 2017'
	}, {
		'_id': '8d1beddb5cc7ed98a61fc28934871b35',
		'contract_id': 'FTS-14029674',
		'asset_type': 'FT Article',
		'user_id': 'b2697f93-52d3-4d42-8409-bdf91b09e894',
		'content_id': 'http://www.ft.com/thing/02c03200-86dc-11e7-bf50-e1c239b45787',
		'time': '2017-08-22T10:54:54.997Z',
		'state': 'complete',
		'user_name': 'James Wise',
		'user_email': 'james.wise@ft.com',
		'content_type': 'article',
		'title': 'Donald Trump warns against hasty withdrawal from Afghanistan ',
		'published_date': '2017-08-22T01:58:37.000Z',
		'syndication_state': 'yes',
		'last_modified': '2017-08-22T10:54:55.376Z',
		'id': '02c03200-86dc-11e7-bf50-e1c239b45787',
		'date': '22 August 2017',
		'published': '22 August 2017'
	}];
	let savedItems = [{
		'_id': '8d1beddb5cc7ed98a61fc28934871b35',
		'contract_id': 'FTS-14029674',
		'asset_type': 'FT Article',
		'user_id': 'b2697f93-52d3-4d42-8409-bdf91b09e894',
		'content_id': 'http://www.ft.com/thing/02c03200-86dc-11e7-bf50-e1c239b45787',
		'time': '2017-08-22T10:54:54.997Z',
		'state': 'saved',
		'user_name': 'James Wise',
		'user_email': 'james.wise@ft.com',
		'content_type': 'article',
		'title': 'Donald Trump warns against hasty withdrawal from Afghanistan ',
		'published_date': '2017-08-22T01:58:37.000Z',
		'syndication_state': 'yes',
		'last_modified': '2017-08-22T10:54:55.376Z',
		'id': '02c03200-86dc-11e7-bf50-e1c239b45787',
		'date': '22 August 2017',
		'published': '22 August 2017'
	}, {
		'_id': 'ee0981e4bebd818374a6c1416029656f',
		'contract_id': 'FTS-14029674',
		'asset_type': 'FT Article',
		'user_id': 'b2697f93-52d3-4d42-8409-bdf91b09e894',
		'content_id': 'http://www.ft.com/thing/b3ec55b0-7dd4-11e7-9108-edda0bcbc928',
		'time': '2017-08-22T10:48:04.022Z',
		'state': 'saved',
		'user_name': 'James Wise',
		'user_email': 'james.wise@ft.com',
		'content_type': 'article',
		'title': 'The gritty truth of life in America’s heartland',
		'published_date': '2017-08-21T04:00:26.000Z',
		'syndication_state': 'yes',
		'last_modified': '2017-08-22T10:48:04.301Z',
		'id': 'b3ec55b0-7dd4-11e7-9108-edda0bcbc928',
		'date': '22 August 2017',
		'published': '21 August 2017'
	}];

	let allItems = downloadedItems.reduce((acc, item) => {
		acc[item.content_id] = JSON.parse(JSON.stringify(item));

		if (item.content_id.startsWith('http')) {
			acc[item.content_id.split('/').pop()] = acc[item.content_id];
		}

		acc[item.content_id].downloaded = true;

		return acc;
	}, {});

	allItems = savedItems.reduce((acc, item) => {
		if (!(item.content_id in acc)) {
			acc[item.content_id] = JSON.parse(JSON.stringify(item));

			if (item.content_id.startsWith('http')) {
				acc[item.content_id.split('/').pop()] = acc[item.content_id];
			}
		}

		acc[item.content_id].saved = true;

		return acc;
	}, allItems);

	beforeEach(function () {
		db = initDB([]);
		db.query.onCall(0).resolves(downloadedItems);
		db.query.onCall(1).resolves(savedItems);

		underTest = proxyquire('../../../server/lib/get-all-existing-items-for-contract', {
			'../../db/pg': sinon.stub().resolves(db),
			'@noCallThru': true
		});
	});

	afterEach(function () {
	});

	it('return an Object of all the existing saved and downloaded items for the specified contract ID', async function () {
		const res = await underTest(contractResponse.contract_id);

		expect(res).to.be.an('object').and.to.eql(allItems);
	});
});
