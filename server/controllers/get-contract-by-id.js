'use strict';

const path = require('path');
//const util = require('util');

const { default: log } = require('@financial-times/n-logger');

const {
	SALESFORCE: {
		ENVIRONMENT: SALESFORCE_ENVIRONMENT
	}
} = require('config');

const contractsColumnMappings = require('../../db/pg/column_mappings/contracts');
const pgMapColumns = require('../../db/pg/map-columns');
const pg = require('../../db/pg');

const getSalesforceContractByID = require('../lib/get-salesforce-contract-by-id');
const reformatSalesforceContract = require('../lib/reformat-salesforce-contract');

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

module.exports = exports = async (req, res, next) => {
	try {
		if (SALESFORCE_ENVIRONMENT !== 'production') {
			res.json({
				error: 'IncorrectSalesforceEnvironmentError'
			});

			res.status(400);

			next();

			return;
		}

		let contract = await getSalesforceContractByID(req.params.contract_id);

		if (contract.success === true) {
			res.status(200);

			log.info(`${MODULE_ID} SUCCESS => `, contract);

			if (req.query.save !== '0') {
				let contract_data = reformatSalesforceContract(JSON.parse(JSON.stringify(contract)));
				contract_data.last_updated = new Date();
				contract_data = pgMapColumns(contract_data, contractsColumnMappings);

				const db = await pg();

				await db.syndication.upsert_contract([contract_data]);
			}

			if (req.query.format === 'db') {
				contract.last_updated = new Date();

				contract = reformatSalesforceContract(contract);
			}

			res.json(contract);

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
