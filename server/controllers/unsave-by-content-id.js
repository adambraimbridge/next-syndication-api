'use strict';

const path = require('path');

const { default: log } = require('@financial-times/n-logger');

const HistorySchema = require('../../db/table_schemas/history');
const HistoryTable = require('../../db/tables/history');
const { db, client } = require('../../db/connect');
const toPutItem = require('../../db/toPutItem');

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

		const LICENCE = res.locals.licence;

		const FilterExpression = 'licence_id = :licence_id and item_state = :item_state and content_id = :content_id';
		const ExpressionAttributeValues = {
			':content_id': content.id,
			':licence_id': LICENCE.id,
			':item_state': 'save'
		};

		let response = await client.scanAsync({
			TableName: HistoryTable.TableName,
			FilterExpression,
			ExpressionAttributeValues
		});

		if (response) {
			if (response.Count > 0) {
				log.info(`${MODULE_ID} => ${response.Count} Saved items found for licence#${LICENCE.id}; content#${content.id};`);

				const items = await Promise.all(response.Items.map(async item => {
					item.item_state = 'delete';

					const dbItem = toPutItem(item, HistorySchema);

					return await db.putItemAsync(dbItem);
				}));

				log.info(`${MODULE_ID} => ${items.length} items deleted for licence#${LICENCE.id}; content#${content.id};`, items);

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
			else {
				log.info(`${MODULE_ID} => No items found for licence#${LICENCE.id}; content#${content.id};`);

				res.sendStatus(404);
			}
		}
	}
	catch(error) {
		log.error(`${MODULE_ID} ContentNotFoundError => ${req.params.content_id})`, {
			error: error.stack
		});

		res.sendStatus(500);
	}
};
