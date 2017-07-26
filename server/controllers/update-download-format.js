'use strict';

const path = require('path');

const { default: log } = require('@financial-times/n-logger');

const { DOWNLOAD_ARTICLE_FORMATS } = require('config');

const ContractsSchema = require('../../db/table_schemas/contracts');
const { db } = require('../../db/connect');
const toPutItem = require('../../db/toPutItem');

const getContractById = require('../lib/get-contract-by-id');

const ALLOWED_FORMATS = Object.values(DOWNLOAD_ARTICLE_FORMATS).reduce((acc, val) => {
	acc[val] = val;

	return acc;
}, {});

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

module.exports = exports = async (req, res, next) => {
	if (!(req.body.format in ALLOWED_FORMATS)) {
		throw new TypeError(`Invalid format ${req.body.format}`);
	}

	try {
		const contract = await getContractById(res.locals.syndication_contract.id);

		if (!contract.download_formats) {
			contract.download_formats = {};
		}

		contract.download_formats[res.locals.user.id] = req.body.format;

		let dbItem = toPutItem(contract, ContractsSchema);

		const dbRes = await db.putItemAsync(dbItem);

		log.debug(`${MODULE_ID} | Persisted contract#${res.locals.syndication_contract.id} to DB`, { dbRes });

		const referrer = String(req.get('referrer'));

		if (referrer.endsWith('/republishing/contract')) {
			res.redirect(referrer);

			return;
		}
		else {
			res.sendStatus(204);
		}

		next();
	}
	catch(error) {
		log.error(`${MODULE_ID}`, {
			error: error.stack
		});

		res.sendStatus(500);
	}
};
