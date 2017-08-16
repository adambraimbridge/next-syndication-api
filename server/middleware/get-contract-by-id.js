'use strict';

const path = require('path');

const { default: log } = require('@financial-times/n-logger');

const getContractByID = require('../lib/get-contract-by-id');

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

module.exports = exports = async (req, res, next) => {
	try {
		const { locals } = res;
		const { $DB: db, syndication_contract, user } = locals;

		const contract = locals.contract = await getContractByID(syndication_contract.id, locals);

		await db.syndication.upsert_contract_users([syndication_contract.id, user.user_id, contract.owner_email === user.email]);

		next();
	}
	catch (error) {
		log.error(`${MODULE_ID}`, {
			error: error.stack
		});

		res.sendStatus(400);
	}
};
