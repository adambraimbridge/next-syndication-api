'use strict';

const path = require('path');

const log = require('../../../server/lib/logger');

const pg = require('../../../db/pg');

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

module.exports = exports = async (event, message, response, subscriber) => {
	try {
		const db = await pg();

		log.info(`${MODULE_ID} RECEIVED => `, event);

		if (event.state === 'deleted') {
			const items = await db.syndication.delete_save_history_by_contract_id([event.contract_id, event.content_id]);

			log.info(`${MODULE_ID} => ${items.length} items deleted for contract#${event.contract_id}; content#${event.content_id};`, items);

			return;
		}

		const CONTENT_TYPE_TO_ASSET_TYPE_MAPPING = {
			article: 'FT Article',
			mediaresource: 'Video',
			package: 'FT Article',
			placeholder: 'FT Article',
			podcast: 'Podcast',
			video: 'Video',
		};

		event.asset_type = CONTENT_TYPE_TO_ASSET_TYPE_MAPPING[event.content_type];
		event.user_id = event.user.id;

		await db.syndication.upsert_history([event]);

		log.info(`${MODULE_ID} PERSISTED`);

		subscriber;
	}
	catch (e) {
		log.error(`${MODULE_ID} => `, e);
	}
};
