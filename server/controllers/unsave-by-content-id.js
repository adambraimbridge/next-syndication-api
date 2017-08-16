'use strict';

const path = require('path');

const { default: log } = require('@financial-times/n-logger');

const fetchContentById = require('../lib/fetch-content-by-id');

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

module.exports = exports = async (req, res, next) => {
	try {
		const content = await fetchContentById(req.params.content_id);

		if (Object.prototype.toString.call(content) !== '[object Object]') {
			log.error(`${MODULE_ID} ContentNotFoundError => ${req.params.content_id}`);

			res.sendStatus(404);

			return;
		}

		log.debug(`${MODULE_ID} ContentFoundSuccess => ${content.id}`);

		const { locals: { $DB: db, syndication_contract } } = res;

		const items = await db.syndication.delete_save_history_by_contract_id([syndication_contract.id, content.id]);

		log.info(`${MODULE_ID} => ${items.length} items deleted for contract#${syndication_contract.id}; content#${content.id};`, items);

		const referrer = String(req.get('referrer'));
		const requestedWith = String(req.get('x-requested-with')).toLowerCase();

		if (referrer.includes('/republishing/save') && (requestedWith !== 'xmlhttprequest' && !requestedWith.includes('fetch'))) {
			res.redirect(referrer);

			return;
		}
		else {
			res.sendStatus(204);
		}

		next();
	}
	catch (error) {
		log.error(`${MODULE_ID} ContentNotFoundError => ${req.params.content_id})`, {
			error: error.stack
		});

		res.sendStatus(500);
	}
};
