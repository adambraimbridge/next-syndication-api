'use strict';

const fs = require('fs');
const path = require('path');

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const proxyquire = require('proxyquire');

const {
	MIGRATION_SPREADSHEET_ID,
	NODE_ENV,
	SPREADSHEET_MAPPINGS,
	TEST: { FIXTURES_DIRECTORY },
	THE_GOOGLE: {
		AUTH_FILE_NAME,
		AUTH_KEY
	}
} = require('config');

const { expect } = chai;
chai.use(sinonChai);

const Slack = require('node-slack');

const createKey = require('../../../../worker/crons/migration/create-key');
const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

fs.writeFileSync(path.resolve(AUTH_FILE_NAME), JSON.stringify(AUTH_KEY, null, 2).replace(/\\\\n/g, '\\n') + '\n', 'utf8');

describe(MODULE_ID, function () {
	const contractResponse = require(path.resolve(`${FIXTURES_DIRECTORY}/contractResponse.json`));
	const spreadsheetResponse = require(path.resolve(`${FIXTURES_DIRECTORY}/google-spreadsheet.json`));
	const authKey = require(path.resolve(`${AUTH_FILE_NAME}`));
	const user_id = '8ef593a8-eef6-448c-8560-9ca8cdca80a5';

	let underTest;
	let db;
	let slackStub;
	let spreadsheetStub;

	const { initDB } = require(path.resolve(`${FIXTURES_DIRECTORY}/massive`))();

	after(function () {
//		slackStub.restore();
	});

	before(async function () {
		await createKey();

		db = initDB();

		db.syndication.get_contract_data.resolves([contractResponse]);
		db.syndication.get_migrated_user.resolves([{
			contract_id: null,
			last_modified: null,
			user_id: null
		}]);
		db.syndication.upsert_contract.resolves([contractResponse]);
		db.syndication.upsert_contract_asset.resolves([contractResponse.assets[0]]);
		db.syndication.upsert_migrated_user.resolves([{
			contract_id: contractResponse.contract_id,
			last_modified: new Date(),
			user_id: user_id
		}]);

		slackStub = sinon.stub(Slack.prototype, 'send').resolves({ body: 'ok' });
		spreadsheetStub = sinon.stub().resolves(spreadsheetResponse);

		underTest = proxyquire('../../../../worker/crons/migration/callback', {
			'../../../db/pg': sinon.stub().resolves(db),
			'../../../spreadsheet': spreadsheetStub,
			'../../../server/lib/get-contract-by-id': sinon.stub().resolves(require(path.resolve(`${FIXTURES_DIRECTORY}/contractResponse.json`)))
		});

		await underTest();
	});

	it('retrieves the spreadsheet with the given credentials', async function () {
		expect(spreadsheetStub).to.have.been.calledWith({
			id: MIGRATION_SPREADSHEET_ID,
			key: authKey,
			mappings: SPREADSHEET_MAPPINGS
		});
	});

	it('migrates contracts', async function () {
		expect(db.syndication.get_contract_data.getCall(0)).to.have.been.calledWith([spreadsheetResponse.worksheetsMap.contracts.rows[0].mapped.contract_id]);
		expect(db.syndication.upsert_contract_asset.getCall(0)).to.have.been.calledWith([contractResponse.contract_id, contractResponse.assets[0]]);

		expect(db.syndication.get_contract_data.getCall(1)).to.have.been.calledWith([spreadsheetResponse.worksheetsMap.contracts.rows[1].mapped.contract_id]);
		expect(db.syndication.upsert_contract_asset.getCall(1)).to.have.been.calledWith([contractResponse.contract_id, contractResponse.assets[1]]);
	});

	it('migrates users', async function () {
		expect(db.syndication.get_migrated_user.getCall(0)).to.have.been.calledWith([spreadsheetResponse.worksheetsMap.users.rows[0].mapped.user_id, spreadsheetResponse.worksheetsMap.users.rows[0].mapped.contract_id]);
		expect(db.syndication.upsert_migrated_user.getCall(0)).to.have.been.calledWith([spreadsheetResponse.worksheetsMap.users.rows[0].mapped]);

		expect(db.syndication.get_migrated_user.getCall(1)).to.have.been.calledWith([spreadsheetResponse.worksheetsMap.users.rows[1].mapped.user_id, spreadsheetResponse.worksheetsMap.users.rows[1].mapped.contract_id]);
		expect(db.syndication.upsert_migrated_user.getCall(1)).to.have.been.calledWith([spreadsheetResponse.worksheetsMap.users.rows[1].mapped]);
	});

	it('sends the results to the slack channel', async function () {
		expect(slackStub).to.have.been.calledWith({
			text: `Migration Task | Environment: ${NODE_ENV}`,
			attachments: [{
				color: '#003399',
				fallback: `Contract Migration Task: ${spreadsheetResponse.worksheetsMap.contracts.rows.length} contracts migrated.`,
				pretext: 'Contract Migration Task',
				fields: spreadsheetResponse.worksheetsMap.contracts.rows.map(item => {
					return {
						title: `Contract updated: ${item.mapped.contract_id}`,
						value: `#${item.mapped.__index__ + 2} ${item.mapped.licencee_name} => ${item.mapped.content_type} updated to: ${item.mapped.legacy_download_count}.`,
						short: false
					};
				})
			}, {
				color: '#118833',
				fallback: `User Migration Task: ${spreadsheetResponse.worksheetsMap.users.rows.length} users migrated.`,
				pretext: 'User Migration Task',
				fields: [{
					title: `Users updated: ${spreadsheetResponse.worksheetsMap.users.rows.length}`,
					value: `Spreadsheet rows updated: ${spreadsheetResponse.worksheetsMap.users.rows.map(item => `#${item.mapped.__index__ + 2}`).join(', ')}`,
					short: false
				}]
			}]
		});
	});
});
