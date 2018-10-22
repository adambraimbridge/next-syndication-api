'use strict';

const path = require('path');

const esClient = require('@financial-times/n-es-client');
const { default: log } = require('@financial-times/n-logger');

const enrich = require('./enrich');

const MODULE_ID =
	path.relative(process.cwd(), module.id) ||
	require(path.resolve('./package.json')).name;

module.exports = exports = async (DISTINCT_ITEMS, asObject) => {
	const START = Date.now();

	const DISTINCT_ITEMS_LENGTH = DISTINCT_ITEMS.length;

	if (DISTINCT_ITEMS_LENGTH < 1) {
		return [];
	}

	let items = await esClient.mget({
		ids: DISTINCT_ITEMS,
	});

	log.info(
		`${MODULE_ID} => ${
			items.length
		} items retrieved from elastic search api in ${Date.now() - START}ms`
	);

	items = items.filter(item => enrich(item));

	log.info(
		`${MODULE_ID} => ${
			items.length
		}/${DISTINCT_ITEMS_LENGTH} items found in ${Date.now() - START}ms`
	);

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
