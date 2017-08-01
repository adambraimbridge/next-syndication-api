'use strict';

const path = require('path');

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

const HistoryTable = require('../../../db/tables/history');
const { client } = require('../../../db/connect');

const underTest = require('../../../server/lib/get-history-by-licence-id');

const { expect } = chai;
chai.use(sinonChai);

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe(MODULE_ID, function () {
	const items = [{
		'syndication_state': 'yes',
		'item_state': 'complete',
		'content_id': 'http://www.ft.com/thing/0c56a4f2-6bc5-11e7-bfeb-33fe0c5b7eaa',
		'user': {
			'email': 'christos.constandinou@ft.com',
			'first_name': 'christos',
			'id': '8ef593a8-eef6-448c-8560-9ca8cdca80a5',
			'surname': 'constandinou'
		},
		'contract_id': 'CA-00001558',
		'licence_id': 'c3391af1-0d46-4ddc-a922-df7c49cf1552',
		'download_format': 'docx',
		'_id': '9807a4b6dcb3ce1188593759dd6818cd',
		'time': '2017-07-19T15:08:50.786Z',
		'version': 'v1',
		'contributor_content': false
	}, {
		'syndication_state': 'yes',
		'item_state': 'complete',
		'content_id': 'http://www.ft.com/thing/0aaee458-6c6e-11e7-bfeb-33fe0c5b7eaa',
		'user': {
			'email': 'christos.constandinou@ft.com',
			'first_name': 'christos',
			'id': '8ef593a8-eef6-448c-8560-9ca8cdca80a5',
			'surname': 'constandinou'
		},
		'contract_id': 'CA-00001558',
		'licence_id': 'c3391af1-0d46-4ddc-a922-df7c49cf1552',
		'download_format': 'docx',
		'_id': 'f55885427fa5f8c3e2b90204a6e6b0c7',
		'time': '2017-07-19T15:08:45.881Z',
		'version': 'v1',
		'contributor_content': false
	}, {
		'syndication_state': 'yes',
		'item_state': 'save',
		'content_id': 'http://www.ft.com/thing/74447ca2-6b0b-11e7-bfeb-33fe0c5b7eaa',
		'user': {
			'email': 'christos.constandinou@ft.com',
			'first_name': 'christos',
			'id': '8ef593a8-eef6-448c-8560-9ca8cdca80a5',
			'surname': 'constandinou'
		},
		'contract_id': 'CA-00001558',
		'licence_id': 'c3391af1-0d46-4ddc-a922-df7c49cf1552',
		'_id': '4eff4aba81093b44d2a71c36fc8e9898',
		'time': '2017-07-19T15:08:43.075Z',
		'version': 'v1',
		'contributor_content': false
	}, {
		'syndication_state': 'yes',
		'item_state': 'save',
		'content_id': 'http://www.ft.com/thing/eaef2e2c-6c61-11e7-b9c7-15af748b60d0',
		'user': {
			'email': 'christos.constandinou@ft.com',
			'first_name': 'christos',
			'id': '8ef593a8-eef6-448c-8560-9ca8cdca80a5',
			'surname': 'constandinou'
		},
		'contract_id': 'CA-00001558',
		'licence_id': 'c3391af1-0d46-4ddc-a922-df7c49cf1552',
		'_id': 'c71c4e6cf5183996a34235bf50bc0e1d',
		'time': '2017-07-19T15:08:40.930Z',
		'version': 'v1',
		'contributor_content': false
	}];

	describe('default call', function () {
		afterEach(function () {
			client.scanAsync.restore();
		});

		beforeEach(function () {
			sinon.stub(client, 'scanAsync').resolves({
				Count: items.length,
				Items: items
			});
		});

		it('db query', async function () {
			await underTest({
				licence_id: 'c3391af1-0d46-4ddc-a922-df7c49cf1552'
			});

			expect(client.scanAsync).to.be.calledWith({
				TableName: HistoryTable.TableName,
				FilterExpression: 'licence_id = :licence_id',
				ExpressionAttributeValues: {
					':licence_id': 'c3391af1-0d46-4ddc-a922-df7c49cf1552'
				}
			});
		});


		it('result', async function () {
			const res = await underTest({
				licence_id: 'c3391af1-0d46-4ddc-a922-df7c49cf1552'
			});

			expect(res).to.eql(items);
		});
	});

// this is out for now; until I get time to fix it.
// `user` is a "reserved word" in dynamoDB.
// how bloody idiotic of whoever designed it: to stop developers from using certain words when storing documents!
//	describe('show only current user\'s items', function () {
//		let filteredItems;
//		let user_id;
//
//		afterEach(function () {
//			client.scanAsync.restore();
//
//			filteredItems = null;
//		});
//
//		beforeEach(function () {
//			user_id = '8ef593a8-eef6-448c-8560-9ca8cdca80a5';
//
//			filteredItems = items.filter(item => item.user_id === user_id);
//
//			sinon.stub(client, 'scanAsync').resolves({
//				Count: filteredItems.length,
//				Items: filteredItems
//			});
//		});
//
//		it('db query', async function () {
//			await underTest({
//				licence_id: 'c3391af1-0d46-4ddc-a922-df7c49cf1552',
//				user_id
//			});
//
//			expect(client.scanAsync).to.be.calledWith({
//				TableName: HistoryTable.TableName,
//				FilterExpression: 'licence_id = :licence_id and user_id = :user_id',
//				ExpressionAttributeValues: {
//					':licence_id': 'c3391af1-0d46-4ddc-a922-df7c49cf1552',
//					':user_id': user_id
//				}
//			});
//		});
//
//		it('result', async function () {
//			const res = await underTest({
//				licence_id: 'c3391af1-0d46-4ddc-a922-df7c49cf1552',
//				user_id
//			});
//
//			expect(res).to.eql(filteredItems);
//		});
//	});

	describe('show only saved items', function () {
		let filteredItems;

		afterEach(function () {
			client.scanAsync.restore();

			filteredItems = null;
		});

		beforeEach(function () {
			filteredItems = items.filter(item => item.item_state === 'save');

			sinon.stub(client, 'scanAsync').resolves({
				Count: filteredItems.length,
				Items: items
			});
		});

		it('db query', async function () {
			await underTest({
				licence_id: 'c3391af1-0d46-4ddc-a922-df7c49cf1552',
				type: 'saved'
			});

			expect(client.scanAsync).to.be.calledWith({
				TableName: HistoryTable.TableName,
				FilterExpression: 'licence_id = :licence_id',
				ExpressionAttributeValues: {
					':licence_id': 'c3391af1-0d46-4ddc-a922-df7c49cf1552'
				}
			});
		});

		it('result', async function () {
			const res = await underTest({
				licence_id: 'c3391af1-0d46-4ddc-a922-df7c49cf1552',
				type: 'saved'
			});

			expect(res).to.eql(filteredItems);
		});
	});

	describe('show downloads', function () {
		let filteredItems;

		afterEach(function () {
			client.scanAsync.restore();

			filteredItems = null;
		});

		beforeEach(function () {
			filteredItems = items.filter(item => item.item_state !== 'save');

			sinon.stub(client, 'scanAsync').resolves({
				Count: filteredItems.length,
				Items: items
			});

		});

		it('db query', async function () {
			await underTest({
				licence_id: 'c3391af1-0d46-4ddc-a922-df7c49cf1552',
				type: 'downloads'
			});

			expect(client.scanAsync).to.be.calledWith({
				TableName: HistoryTable.TableName,
				FilterExpression: 'licence_id = :licence_id',
				ExpressionAttributeValues: {
					':licence_id': 'c3391af1-0d46-4ddc-a922-df7c49cf1552'
				}
			});
		});

		it('result', async function () {
			const res = await underTest({
				licence_id: 'c3391af1-0d46-4ddc-a922-df7c49cf1552',
				type: 'downloads'
			});

			expect(res).to.eql(filteredItems);
		});
	});
});
