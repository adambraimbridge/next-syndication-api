'use strict';

const path = require('path');

const { default: log } = require('@financial-times/n-logger');

const getContractByID = require('../lib/get-contract-by-id');

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

module.exports = exports = async (req, res, next) => {
	try {
		res.locals.contract = await getContractByID(res.locals.syndication_contract.id);

		next();
	}
	catch (error) {
		log.error(`${MODULE_ID}`, {
			error: error.stack
		});

		res.sendStatus(400);
	}
};
