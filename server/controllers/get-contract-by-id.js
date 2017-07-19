'use strict';

const path = require('path');
//const util = require('util');

const { default: log } = require('@financial-times/n-logger');

const {
	SALESFORCE: {
		ENVIRONMENT: SALESFORCE_ENVIRONMENT
	}
} = require('config');

const getContractByID = require('../lib/get-contract-by-id');

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

		const contract = await getContractByID(req.params.contract_id);

		if (contract.success === true) {
			res.status(200);
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
