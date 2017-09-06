'use strict';

const path = require('path');

const { default: log } = require('@financial-times/n-logger');

const Slack = require('node-slack');
const moment = require('moment');

const pg = require('../../../db/pg');
const SpreadSheet = require('../../../spreadsheet');
const getContractByID = require('../../../server/lib/get-contract-by-id');

const {
	MIGRATION_SPREADSHEET_ID,
	NODE_ENV,
	SALESFORCE: {
		CRON_CONFIG: SALESFORCE_CRON_CONFIG
	},
	SLACK,
	SPREADSHEET_MAPPINGS,
	THE_GOOGLE: {
		AUTH_FILE_NAME
	}
} = require('config');

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

let firstRun = true;
let running = false;
let lastRun = Date.now();
let salesforceQueryCount = 0;

log.info(`${MODULE_ID} => started`);

module.exports = exports = async () => {
	const date = moment();
	const [, , , , min, sec, ms] = date.toArray();

	if (firstRun !== true) {
		if (running === true || min % 15 !== 0 || (sec > 1 || ms > 250)) {
			log.debug(`${MODULE_ID} => THROTTLED!!! Already run/running.`);

			return;
		}
	}
	else {
		firstRun = false;
	}

	if (Date.now() - lastRun >= SALESFORCE_CRON_CONFIG.MAX_TIME_PER_CALL) {
		salesforceQueryCount = 0;
	}

	lastRun = Date.now();
	running = true;

	log.debug(`${MODULE_ID} => Migration running`);

	try {
		const key = require(path.resolve(AUTH_FILE_NAME));
		const ss = await SpreadSheet({
			id: MIGRATION_SPREADSHEET_ID,
			key: key,
			mappings: SPREADSHEET_MAPPINGS
		});

		const contracts = await migrateContracts(ss.worksheetsMap.contracts.rows);

		const users = await migrateUsers(ss.worksheetsMap.users.rows);

		if (contracts.length || users.length) {
			const slack = new Slack(SLACK.INCOMING_HOOK_URL);

			const message = formatSlackMessage(contracts, users);

			await slack.send(message);

			return message;
		}

		log.debug(`${MODULE_ID} => Migration complete`);
	}
	catch (e) {
		log.error(`${MODULE_ID} => `, e);
	}

	running = false;
};

function formatSlackMessage(contracts, users) {
	const contractsMessage = {
		color: '#003399',
		fallback: `Contract Migration Task: ${contracts.length} contracts migrated.`,
		pretext: 'Contract Migration Task'
	};
	const usersMessage = {
		color: '#118833',
		fallback: `User Migration Task: ${users.length} users migrated.`,
		pretext: 'User Migration Task'
	};

	if (contracts.length) {
		contractsMessage.fields = contracts.map(item => {
			return {
				title: `Contract updated: ${item.contract_id}`,
				value: `#${item.__index__ + 2} ${item.licencee_name} => ${item.content_type} updated to: ${item.legacy_download_count}.`,
				short: false
			};
		});
	}
	else {
		contractsMessage.fields = [{
			title: 'Contracts',
			value: 'No contracts were migrated.',
			short: false
		}];
	}

	if (users.length) {
		usersMessage.fields = [{
			title: `Users updated: ${users.length}`,
			value: `Spreadsheet rows updated: ${users.map(item => `#${item.__index__ + 2}`).join(', ')}`,
			short: false
		}];
	}
	else {
		usersMessage.fields = [{
			title: 'Users',
			value: 'No users were migrated.',
			short: false
		}];
	}

	const attachments = [contractsMessage, usersMessage];

	return {
		text: `Migration Task | Environment: ${NODE_ENV}`,
		attachments
	};
}

async function migrateContract(db, item) {
	let [contract] = await db.syndication.get_contract_data([item.mapped.contract_id]);

	if ((!contract || contract.contract_id === null) && salesforceQueryCount < SALESFORCE_CRON_CONFIG.MAX_CALLS) {
		++salesforceQueryCount;

		contract = await getContractByID(item.mapped.contract_id);
	}

	let asset = contract.assets.find(asset => asset.content_type === item.mapped.content_type);

	const legacy_download_count = item.mapped.legacy_download_count = parseInt(item.mapped.legacy_download_count, 10);

	if (asset) {
		if (parseInt(asset.legacy_download_count, 10) === legacy_download_count) {
			log.info(`${MODULE_ID} | contract asset already migrated => ${JSON.stringify(asset)}`);

			return null;
		}

		asset.legacy_download_count = legacy_download_count;

		[asset] = await db.syndication.upsert_contract_asset([item.mapped.contract_id, asset]);

		log.info(`${MODULE_ID} | upserted migrated contract asset => ${JSON.stringify(asset)}`);
	}
	else {
		return null;
	}

	return item.mapped;
}

async function migrateContracts(rows) {
	const db = await pg();

	let items = await Promise.all(rows.map(async item => await migrateContract(db, item)));

	return items.filter(item => item);
}

async function migrateUser(db, item) {
	let [user] = await db.syndication.get_migrated_user([item.mapped.user_id, item.mapped.contract_id]);

	if (user && user.user_id !== null) {
		log.info(`${MODULE_ID} | user already migrated => ${JSON.stringify(user)}`);

		return null;
	}

	[user] = await db.syndication.upsert_migrated_user([item.mapped]);

	log.info(`${MODULE_ID} | upserted migrated user => ${JSON.stringify(user)}`);

	return item.mapped;
}

async function migrateUsers(rows) {
	const db = await pg();

	let items = await Promise.all(rows.map(async item => await migrateUser(db, item)));

	return items.filter(item => item);
}