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

	const items = [{
		'syndication_state': 'yes',
		'state': 'complete',
		'content_id': 'http://www.ft.com/thing/0c56a4f2-6bc5-11e7-bfeb-33fe0c5b7eaa',
		'user_email': 'christos.constandinou@ft.com',
		'user_name': 'christos constandinou',
		'user_id': '8ef593a8-eef6-448c-8560-9ca8cdca80a5',
		'contract_id': 'CA-00001558',
		'licence_id': 'c3391af1-0d46-4ddc-a922-df7c49cf1552',
		'download_format': 'docx',
		'_id': '9807a4b6dcb3ce1188593759dd6818cd',
		'time': '2017-07-19T15:08:50.786Z',
		'version': 'v1',
		'contributor_content': false
	}, {
		'syndication_state': 'yes',
		'state': 'complete',
		'content_id': 'http://www.ft.com/thing/0aaee458-6c6e-11e7-bfeb-33fe0c5b7eaa',
		'user_email': 'christos.constandinou@ft.com',
		'user_name': 'christos constandinou',
		'user_id': '8ef593a8-eef6-448c-8560-9ca8cdca80a5',
		'contract_id': 'CA-00001558',
		'licence_id': 'c3391af1-0d46-4ddc-a922-df7c49cf1552',
		'download_format': 'docx',
		'_id': 'f55885427fa5f8c3e2b90204a6e6b0c7',
		'time': '2017-07-19T15:08:45.881Z',
		'version': 'v1',
		'contributor_content': false
	}, {
		'syndication_state': 'yes',
		'state': 'saved',
		'content_id': 'http://www.ft.com/thing/74447ca2-6b0b-11e7-bfeb-33fe0c5b7eaa',
		'user_email': 'christos.constandinou@ft.com',
		'user_name': 'christos constandinou',
		'user_id': '8ef593a8-eef6-448c-8560-9ca8cdca80a5',
		'contract_id': 'CA-00001558',
		'licence_id': 'c3391af1-0d46-4ddc-a922-df7c49cf1552',
		'_id': '4eff4aba81093b44d2a71c36fc8e9898',
		'time': '2017-07-19T15:08:43.075Z',
		'version': 'v1',
		'contributor_content': false
	}, {
		'syndication_state': 'yes',
		'state': 'saved',
		'content_id': 'http://www.ft.com/thing/eaef2e2c-6c61-11e7-b9c7-15af748b60d0',
		'user_email': 'christos.constandinou@ft.com',
		'user_name': 'christos constandinou',
		'user_id': '8ef593a8-eef6-448c-8560-9ca8cdca80a5',
		'contract_id': 'CA-00001558',
		'licence_id': 'c3391af1-0d46-4ddc-a922-df7c49cf1552',
		'_id': 'c71c4e6cf5183996a34235bf50bc0e1d',
		'time': '2017-07-19T15:08:40.930Z',
		'version': 'v1',
		'contributor_content': false
	}];

	const itemsMap = items.reduce((acc, item) => {
		acc[item.content_id] = item;

		return acc;
	}, {});

	const contract_id = 'CA-00001558';

	let db;
	let underTest;

	describe('default call', function () {
		afterEach(function () {
			db = null;
			underTest = null;
		});

		beforeEach(function () {
			db = initDB(items);

			underTest = proxyquire('../../../server/lib/get-history-by-contract-id', {
				'../../db/pg': sinon.stub().resolves(db),
				'./get-all-existing-items-for-contract': sinon.stub().resolves(itemsMap),
				'@noCallThru': true
			});
		});

		it('db query', async function () {
			await underTest({
				contract_id: 'CA-00001558'
			});

			expect(db.run).to.be.calledWith(`SELECT * FROM syndication.get_downloads_by_contract_id($text$${contract_id}$text$::text);`);
		});


		it('result', async function () {
			const res = await underTest({
				contract_id: 'CA-00001558'
			});

			expect(res).to.eql(items);
		});
	});

	describe('show only current user\'s items', function () {
		let filteredItems;
		let user_id;

		afterEach(function () {
			db = null;
			filteredItems = null;
			underTest = null;
		});

		beforeEach(function () {
			user_id = '8ef593a8-eef6-448c-8560-9ca8cdca80a5';

			filteredItems = items.filter(item => item.user_id === user_id);

			db = initDB(filteredItems);

			underTest = proxyquire('../../../server/lib/get-history-by-contract-id', {
				'../../db/pg': sinon.stub().resolves(db),
				'./get-all-existing-items-for-contract': sinon.stub().resolves(itemsMap),
				'@noCallThru': true
			});
		});

		it('db query', async function () {
			await underTest({
				contract_id,
				user_id
			});

			expect(db.run).to.be.calledWith(`SELECT * FROM syndication.get_downloads_by_contract_id($text$${contract_id}$text$::text, $text$${user_id}$text$::text);`);
		});

		it('result', async function () {
			const res = await underTest({
				contract_id: 'CA-00001558',
				user_id
			});

			expect(res).to.eql(filteredItems);
		});
	});

	describe('show only saved items', function () {
		let filteredItems;

		afterEach(function () {
			db = null;
			filteredItems = null;
			underTest = null;
		});

		beforeEach(function () {
			filteredItems = items.filter(item => item.state === 'saved');

			db = initDB(filteredItems);

			underTest = proxyquire('../../../server/lib/get-history-by-contract-id', {
				'../../db/pg': sinon.stub().resolves(db),
				'./get-all-existing-items-for-contract': sinon.stub().resolves(itemsMap),
				'@noCallThru': true
			});
		});

		it('db query', async function () {
			await underTest({
				contract_id: 'CA-00001558',
				type: 'saved'
			});

			expect(db.run).to.be.calledWith(`SELECT * FROM syndication.get_saved_items_by_contract_id($text$${contract_id}$text$::text);`);
		});

		it('result', async function () {
			const res = await underTest({
				contract_id: 'CA-00001558',
				type: 'saved'
			});

			expect(res).to.eql(filteredItems);
		});
	});

	describe('show downloads', function () {
		let filteredItems;

		afterEach(function () {
			db = null;
			filteredItems = null;
			underTest = null;
		});

		beforeEach(function () {
			filteredItems = items.filter(item => item.state !== 'saved');

			db = initDB(filteredItems);

			underTest = proxyquire('../../../server/lib/get-history-by-contract-id', {
				'../../db/pg': sinon.stub().resolves(db),
				'./get-all-existing-items-for-contract': sinon.stub().resolves(itemsMap),
				'@noCallThru': true
			});
		});

		it('db query', async function () {
			await underTest({
				contract_id: 'CA-00001558',
				type: 'downloads'
			});

			expect(db.run).to.be.calledWith(`SELECT * FROM syndication.get_downloads_by_contract_id($text$${contract_id}$text$::text);`);
		});

		it('result', async function () {
			const res = await underTest({
				contract_id: 'CA-00001558',
				type: 'downloads'
			});

			expect(res).to.eql(filteredItems);
		});
	});
});
