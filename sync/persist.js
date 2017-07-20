'use strict';

const { db } = require('../db/connect');
const HistorySchema = require('../db/table_schemas/history');
const toPutItem = require('../db/toPutItem');

module.exports = exports = async (event) => {
	const item = toPutItem(event, HistorySchema);

	return await db.putItemAsync(item);
};
