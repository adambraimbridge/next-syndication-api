'use strict';

const path = require('path');

const { default: log } = require('@financial-times/n-logger');
const moment = require('moment');

const {
	SALESFORCE: {
//		ENVIRONMENT: SALESFORCE_ENVIRONMENT,
		REFRESH_CONTRACT_PERIOD: SALESFORCE_REFRESH_CONTRACT_PERIOD
//		TEST_CONTRACT: SALESFORCE_TEST_CONTRACT
	}
} = require('config');

const ContractsSchema = require('../../db/table_schemas/contracts');
const ContractsTable = require('../../db/tables/contracts');
const { db, client } = require('../../db/connect');
const toPutItem = require('../../db/toPutItem');
const getContractByID = require('../lib/get-contract-by-id');

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

function decorateContract(contract) {
	contract.contract_date = `${moment(contract.contract_starts).format('DD/MM/YY')} - ${moment(contract.contract_ends).format('DD/MM/YY')}`;

	const contentAllowed = [];

	if (contract.limit_article > 0) {
		contentAllowed.push('Articles');
	}

	if (contract.limit_podcast > 0) {
		contentAllowed.push('Podcasts');
	}

	if (contract.limit_video > 0) {
		contentAllowed.push('Video');
	}

	switch (contentAllowed.length) {
		case 1:
			contract.content_allowed = `${contentAllowed[0]} only`;
			break;
		default:
			contract.content_allowed = `${contentAllowed.slice(0, -1).join(', ')} & ${contentAllowed[contentAllowed.length - 1]}`;
	}

	return contract;
}

module.exports = exports = async (req, res, next) => {
	try {
		const SALESFORCE_CONTRACT_ID = /*SALESFORCE_ENVIRONMENT === 'sandbox'
									? SALESFORCE_TEST_CONTRACT
									:*/ res.locals.syndication_contract.id;

		const dbItem = await client.getAsync({
			TableName: ContractsTable.TableName,
			Key: {
				[ContractsTable.AttributeDefinitions[0].AttributeName]: SALESFORCE_CONTRACT_ID
			}
		});

		if (dbItem.Item && dbItem.Item[ContractsTable.AttributeDefinitions[0].AttributeName] === SALESFORCE_CONTRACT_ID) {
			const item = dbItem.Item;
			let last_updated = Date.now() - +(new Date(item.last_updated));

			if (last_updated < SALESFORCE_REFRESH_CONTRACT_PERIOD) {
				log.debug(`${MODULE_ID} | Using DB version of contract#${SALESFORCE_CONTRACT_ID}`, dbItem);

				res.status(200);

				res.json(decorateContract(item));

				next();

				return;
			}
		}

		const contract = await getContractByID(SALESFORCE_CONTRACT_ID);

		if (contract.success === true) {
			contract.last_updated = (new Date()).toJSON();

			let dbItem = toPutItem(contract, ContractsSchema);

			const dbRes = await db.putItemAsync(dbItem);

			dbItem = await client.getAsync({
				TableName: ContractsTable.TableName,
				Key: {
					[ContractsTable.AttributeDefinitions[0].AttributeName]: SALESFORCE_CONTRACT_ID
				}
			});

			log.debug(`${MODULE_ID} | Persisted contract#${SALESFORCE_CONTRACT_ID} to DB`, { dbItem, dbRes });

			res.status(200);

			res.json(decorateContract(dbItem.Item));

			next();
		}
		else {
			res.status(400);
			res.json({
				error: contract.errorMessage
			});
		}
	}
	catch (error) {
		log.error(`${MODULE_ID}`, {
			error: error.stack
		});

		res.sendStatus(500);
	}
};
