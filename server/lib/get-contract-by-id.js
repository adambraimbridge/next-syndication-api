'use strict';

const path = require('path');

const { default: log } = require('@financial-times/n-logger');
const moment = require('moment');

const {
	SALESFORCE: {
		REFRESH_CONTRACT_PERIOD: SALESFORCE_REFRESH_CONTRACT_PERIOD
	}
} = require('config');

const ContractsSchema = require('../../db/table_schemas/contracts');
const ContractsTable = require('../../db/tables/contracts');
const { db, client } = require('../../db/connect');
const toPutItem = require('../../db/toPutItem');
const getSalesforceContractByID = require('./get-salesforce-contract-by-id');

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

function decorateContract(contract) {
	contract.contract_date = `${moment(contract.contract_starts).format('DD/MM/YY')} - ${moment(contract.contract_ends).format('DD/MM/YY')}`;

	const contentAllowed = [];
	const limits = { total: 0 };

	if (!contract.limits) {
		contract.limits = {
			article: -1,
			podcast: - 1,
			total: -1,
			video: -1
		}
	}

	if (contract.articleLimit > 0 || contract.limits.article > 0) {
		contentAllowed.push('Articles');

		const limit = contract.articleLimit || contract.limits.article;

		limits.article = limit;

		limits.total += limit;
	}

	if (contract.podcastLimit > 0 || contract.limits.podcast > 0) {
		contentAllowed.push('Podcasts');

		const limit = contract.podcastLimit || contract.limits.podcast;

		limits.podcast = limit;

		limits.total += limit;
	}

	if (contract.videoLimit > 0 || contract.limits.video > 0) {
		contentAllowed.push('Video');

		const limit = contract.videoLimit || contract.limits.video;

		limits.video = limit;

		limits.total += limit;

		delete contract.videoLimit;
	}

	switch (contentAllowed.length) {
		case 1:
			contract.content_allowed = `${contentAllowed[0]} only`;
			break;
		default:
			contract.content_allowed = `${contentAllowed.slice(0, -1).join(', ')} & ${contentAllowed[contentAllowed.length - 1]}`;
	}

	contract.limits = limits;

	return contract;
}

module.exports = exports = async (contractID) => {
	const doc = await client.getAsync({
		TableName: ContractsTable.TableName,
		Key: {
			[ContractsTable.AttributeDefinitions[0].AttributeName]: contractID
		}
	});

	if (doc.Item && doc.Item[ContractsTable.AttributeDefinitions[0].AttributeName] === contractID) {
		const item = doc.Item;
		let last_updated = Date.now() - +(new Date(item.last_updated));

		if (last_updated < SALESFORCE_REFRESH_CONTRACT_PERIOD) {
			log.debug(`${MODULE_ID} | Using DB version of contract#${contractID}`, doc);

			return decorateContract(item);
		}
	}

	const contract = await getSalesforceContractByID(contractID);

	if (contract.success === true) {
		contract.last_updated = (new Date()).toJSON();

		let dbItem = toPutItem(decorateContract(contract), ContractsSchema);

		const res = await db.putItemAsync(dbItem);

		dbItem = await client.getAsync({
			TableName: ContractsTable.TableName,
			Key: {
				[ContractsTable.AttributeDefinitions[0].AttributeName]: contractID
			}
		});

		log.debug(`${MODULE_ID} | Persisted contract#${contractID} to DB`, { dbItem, res });

		return dbItem.Item;
	}
	else {
		throw new Error(contract.errorMessage);
	}
};
