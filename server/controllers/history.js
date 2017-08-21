'use strict';

const path = require('path');

const { default: log } = require('@financial-times/n-logger');

const getHistoryByContractID  = require('../lib/get-history-by-contract-id');

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

module.exports = exports = async (req, res, next) => {
	try {
		const CONTRACT = res.locals.syndication_contract;

		const options = {
			contract_id: CONTRACT.id
		};

		if (req.query.show === 'mine') {
			options.user_id = res.locals.userUuid;
		}

		if (req.query.type) {
			options.type = req.query.type;
		}

		if (req.query.offset) {
			const offset = parseInt(req.query.offset, 10);

			if (typeof offset === 'number' && offset === offset) {
				options.offset = offset;
			}
		}

		if (req.query.limit) {
			const limit = parseInt(req.query.limit, 10);

			if (typeof limit === 'number' && limit === limit) {
				options.limit = limit;
			}
		}

		const items = await getHistoryByContractID(options);

		if (Array.isArray(items)) {
			res.status(200);
			res.json(items);
		}
		else {
			res.sendStatus(400);
		}

		next();
	}
	catch(error) {
		log.error(`${MODULE_ID}`, {
			error: error.stack
		});

		res.sendStatus(400);
	}
};
