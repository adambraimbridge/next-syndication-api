'use strict';

const path = require('path');

const { default: log } = require('@financial-times/n-logger');

const HistorySchema = require('../../db/table_schemas/history');
const persist = require('../persist');

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

module.exports = exports = async (event, message, response, subscriber) => {
	try {
		log.debug(`${MODULE_ID} RECEIVED => `, event);

		let res = await persist(event, HistorySchema);

		log.debug(`${MODULE_ID} PERSISTED => `, res);

		await subscriber.ack(message);
	}
	catch (e) {
		log.error(`${MODULE_ID} => `, e);
	}
};
