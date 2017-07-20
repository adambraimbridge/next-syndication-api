'use strict';

const path = require('path');
//const util = require('util');

const { default: log } = require('@financial-times/n-logger');

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

module.exports = exports = async (req, res, next) => {
	try {
		const SALESFORCE_CONTRACT_ID = /*SALESFORCE_ENVIRONMENT === 'sandbox'
									? SALESFORCE_TEST_CONTRACT
									:*/ res.locals.syndicationContractID;

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

				res.json(item);

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

			res.json(dbItem.Item);

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
