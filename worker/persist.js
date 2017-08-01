'use strict';

const { db } = require('../db/connect');
const toPutItem = require('../db/toPutItem');

module.exports = exports = async (event, Schema) => {
	const item = toPutItem(event, Schema);

	return await db.putItemAsync(item);
};
