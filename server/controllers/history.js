'use strict';

const path = require('path');

const { default: log } = require('@financial-times/n-logger');

const getContent = require('../lib/get-content');
const getHistoryByContractID  = require('../lib/get-history-by-contract-id');
const resolve = require('../lib/resolve');
const messageCode = require('../lib/resolve/messageCode');

const RESOLVE_PROPERTIES = Object.keys(resolve);

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

module.exports = exports = async (req, res, next) => {
	const START = Date.now();

	try {
		const CONTRACT = res.locals.contract;

		const options = {
			contract_id: CONTRACT.contract_id
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

		let history = await getHistoryByContractID(options);

		const contentItems = await getContent(history.items.map(({ id }) => id));
		const contentItemsMap = contentItems.reduce((acc, item) => {
			acc[item.id] = item;
			acc[item.id.split('/').pop()] = item;

			return acc;
		}, {});

		history.items = history.items.map(item => RESOLVE_PROPERTIES.reduce((acc, prop) => {
			let contentItem = contentItemsMap[item.content_id] || {};
			acc[prop] = resolve[prop](contentItem[prop], prop, contentItem, item, CONTRACT);

			return acc;
		}, item));

		history.items.forEach(item => messageCode(item, CONTRACT));

		log.debug(`${MODULE_ID} => Retrieved ${history.items.length} items in ${Date.now() - START}ms`);

		if (Array.isArray(history.items)) {
			res.status(200);
			res.json(history);
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
