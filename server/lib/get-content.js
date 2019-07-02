'use strict';

const esClient = require('@financial-times/n-es-client');

const enrich = require('./enrich');

module.exports = exports = async (DISTINCT_ITEMS, asObject) => {

	const DISTINCT_ITEMS_LENGTH = DISTINCT_ITEMS.length;

	if (DISTINCT_ITEMS_LENGTH < 1) {
		return [];
	}

	let items = await esClient.mget({
		ids: DISTINCT_ITEMS
	});

	items = items.filter(item => enrich(item));

	if (asObject === true) {
		return items.reduce((acc, item) => {
			acc[item.id] = item;

			// this is for backwards/forwards support with Content API/Elastic Search
			if (item.id.includes('/')) {
				acc[item.id.split('/').pop()] = item;
			}

			return acc;
		}, {});
	}

	return items;
};
