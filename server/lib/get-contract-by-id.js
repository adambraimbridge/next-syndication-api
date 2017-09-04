'use strict';

const path = require('path');

const { default: log } = require('@financial-times/n-logger');
const moment = require('moment');

const {
	ASSET_TYPE_TO_DISPLAY_TYPE,
	SALESFORCE: {
		REFRESH_CONTRACT_PERIOD: SALESFORCE_REFRESH_CONTRACT_PERIOD
	}
} = require('config');

const contractsColumnMappings = require('../../db/pg/column_mappings/contracts');
const pgMapColumns = require('../../db/pg/map-columns');
const pg = require('../../db/pg');
const getSalesforceContractByID = require('./get-salesforce-contract-by-id');

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

function decorateContract(contract) {
	contract.contract_date = `${moment(contract.start_date).format('DD/MM/YY')} - ${moment(contract.end_date).format('DD/MM/YY')}`;

	const contentAllowed = [];

	contract.assetsMap = contract.assets.reduce((acc, asset) => {
		if (asset.download_limit > 0) {
			contentAllowed.push(ASSET_TYPE_TO_DISPLAY_TYPE[asset.asset_type]);
		}

		acc[asset.asset_type] =
		acc[asset.content_type] = asset;

		asset.content = asset.content_areas.join('; ');

		return acc;
	}, {});

	switch (contentAllowed.length) {
		case 1:
			contract.content_allowed = `${contentAllowed[0]} only`;
			break;
		default:
			contract.content_allowed = `${contentAllowed.slice(0, -1).join(', ')} & ${contentAllowed[contentAllowed.length - 1]}`;
	}

	return contract;
}

module.exports = exports = async (contractID, locals) => {
	const db = await pg();

	let [contract_data] = await db.syndication.get_contract_data([contractID]);

	if (contract_data && contract_data.contract_id !== null) {
		let last_updated = Date.now() - +contract_data.last_updated;

		if (last_updated < SALESFORCE_REFRESH_CONTRACT_PERIOD) {
			log.debug(`${MODULE_ID} | Using DB version of contract#${contractID}`, contract_data);

			return decorateContract(contract_data);
		}
	}

	let contract = await getSalesforceContractByID(contractID);

	if (contract.success === true) {
		contract.last_updated = new Date();
		contract = pgMapColumns(contract, contractsColumnMappings);

		if (locals && locals.licence) {
			contract.licence_id = locals.licence.id;
		}

		[contract_data] = await db.syndication.upsert_contract([contract]);

		[contract_data] = await db.syndication.get_contract_data([contractID]);

		log.debug(`${MODULE_ID} | Persisted contract#${contractID} to DB`, { contract_data });

		return decorateContract(contract_data);
	}
	else {
		throw new Error(contract.errorMessage);
	}
};
