'use strict';

const path = require('path');

const { default: log } = require('@financial-times/n-logger');

const pg = require('../../db/pg');

const { CONTENT_TYPE_TO_ASSET_TYPE } = require('config');

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

module.exports = exports = async (event, message, response, subscriber) => {
	try {
		const db = await pg();

		log.debug(`${MODULE_ID} RECEIVED => `, event);

		event.asset_type = CONTENT_TYPE_TO_ASSET_TYPE[event.content_type];
		event.user_id = event.user.id;

		await db.syndication.upsert_history([event]);

		log.debug(`${MODULE_ID} PERSISTED`);

		await subscriber.ack(message);
	}
	catch (e) {
		log.error(`${MODULE_ID} => `, e);
	}
};
