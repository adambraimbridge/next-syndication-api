'use strict';

const path = require('path');

const { expect } = require('chai');

const {
	TEST: { FIXTURES_DIRECTORY }
} = require('config');

const contractsColumnMappings = require('../../../db/pg/column_mappings/contracts');
const historyColumnMappings = require('../../../db/pg/column_mappings/history');
const usersColumnMappings = require('../../../db/pg/column_mappings/users');

const underTest = require('../../../db/pg/map-columns');

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe(MODULE_ID, function () {

	describe('contracts', function() {
		const contractProfile = require(path.resolve(`${FIXTURES_DIRECTORY}/contractProfile.json`));

		it('assigns existing properties to their respective DB column names', async function () {
			const res = underTest(JSON.parse(JSON.stringify(contractProfile)), contractsColumnMappings);

			expect(res).to.eql({
				'owner_email': 'john.q@average.com',
				'owner_name': 'John Q. Average',
				'start_date': '2017-10-11',
				'end_date': '2018-10-10',
				'contributor_content': false,
				'licencee_name': 'John Q. Average Account',
				'assets': [{
					'download_limit': 15,
					'online_usage_limit': 20,
					'product': 'Video',
					'online_usage_period': 'Week',
					'print_usage_period': 'Week',
					'print_usage_limit': 20,
					'embargo_period': 10,
					'asset_class': 'New',
					'asset_type': 'Video',
					'content_type': 'video',
					'contentSet': 'FT Newspaper'
				}, {
					'download_limit': 15,
					'online_usage_limit': 20,
					'product': 'FT Article',
					'online_usage_period': 'Week',
					'print_usage_period': 'Week',
					'print_usage_limit': 20,
					'embargo_period': 10,
					'asset_class': 'New',
					'asset_type': 'FT Article',
					'content_type': 'article',
					'contentSet': 'FT Newspaper'
				}],
				'contract_id': 'FTS-12345678',
				'client_website': 'http://ft.com',
				'client_publications': 'FT.com',

				'videoLimit': 15,
				'success': true,
				'podcastLimit': 0,
				'errorMessage': null,
				'articleLimit': 15
			});
		});
	});

	describe('history', function() {
		it('assigns existing properties to their respective DB column names', async function () {
			const res = underTest({
				'syndication_state': 'yes',
				'state': 'complete',
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
			}, historyColumnMappings);

			expect(res).to.eql({
				'syndication_state': 'yes',
				'state': 'complete',
				'content_id': 'http://www.ft.com/thing/0c56a4f2-6bc5-11e7-bfeb-33fe0c5b7eaa',
				'user': {
					'email': 'christos.constandinou@ft.com',
					'first_name': 'christos',
					'id': '8ef593a8-eef6-448c-8560-9ca8cdca80a5',
					'surname': 'constandinou'
				},
				'user_id': '8ef593a8-eef6-448c-8560-9ca8cdca80a5',
				'contract_id': 'CA-00001558',
				'licence_id': 'c3391af1-0d46-4ddc-a922-df7c49cf1552',
				'download_format': 'docx',
				'_id': '9807a4b6dcb3ce1188593759dd6818cd',
				'time': '2017-07-19T15:08:50.786Z',
				'version': 'v1',
				'contributor_content': false
			});
		});
	});

	describe('users', function() {
		const { user: userProfile } = require(path.resolve(`${FIXTURES_DIRECTORY}/userProfile.json`));

		it('assigns existing properties to their respective DB column names', async function () {
			const res = underTest(JSON.parse(JSON.stringify(userProfile)), usersColumnMappings);

			expect(res).to.eql({
				'user_id': '8ef593a8-eef6-448c-8560-9ca8cdca80a5',
				'email': 'christos.constandinou@ft.com',
				'title': null,
				'first_name': 'christos',
				'surname': 'constandinou',
				'primaryTelephone': null,
				'homeAddress': {
					'line1': null,
					'line2': null,
					'townCity': null,
					'state': null,
					'postcode': null,
					'country': null
				},
				'marketing': { 'ftByEmail': false, 'ftByPost': false },
				'demographics': { 'industry': null, 'position': null, 'responsibility': null },
				'jobTitle': null,
				'href': '/users/8ef593a8-eef6-448c-8560-9ca8cdca80a5'
			});
		});
	});
});
