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

		let { body } = req;

		if (!Array.isArray(body)) {
			log.error(`${MODULE_ID} Expected \`req.body\` to be [object Array] and got \`${Object.prototype.toString.call(body)}\` instead`);

			return res.sendStatus(400);
		}

		if (!body.length) {
			log.error(`${MODULE_ID} \`req.body\` does not contain any contract IDs`);

			return res.sendStatus(400);
		}

		const contracts = await Promise.all(body.map(async contract_id => await getContractByID(contract_id, true)));

		res.status(200);
		res.json(contracts);

		next();
	}
	catch (error) {
		log.error(`${MODULE_ID}`, {
			error: error.stack
		});

		res.sendStatus(500);
	}
};
