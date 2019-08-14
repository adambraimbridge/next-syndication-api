'use strict';

const log = require('../lib/logger');

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
				event: 'GET_CONTRACT_BY_ID_ERROR',
				error: contract.errorMessage
			});
		}
	}
	catch (error) {
		log.error({
			route: req.route.path,
			error
		});

		res.sendStatus(500);
	}
};
