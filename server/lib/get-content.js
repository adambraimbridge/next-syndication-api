'use strict';

const path = require('path');

const esClient = require('@financial-times/n-es-client');
const { default: log } = require('@financial-times/n-logger');

//const pg = require('../../db/pg');

const enrich = require('./enrich');
//const getContentById = require('./get-content-by-id');

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

module.exports = exports = async (DISTINCT_ITEMS) => {
	const START = Date.now();

//	const db = await pg();

	const DISTINCT_ITEMS_LENGTH = DISTINCT_ITEMS.length;

//	let cachedItems = await db.run(`SELECT * FROM syndication.get_content(ARRAY[$text$${DISTINCT_ITEMS.join('$text$, $text$')}$text$]);`);

//	log.info(`${MODULE_ID} => ${cachedItems.length} items retrieved from cache`);

//	cachedItems = cachedItems.map(item => item.data);

//	cachedItems.forEach(item =>
//		DISTINCT_ITEMS.splice(DISTINCT_ITEMS.indexOf(item.id.split('/').pop()), 1));

	let esContentItems = await esClient.mget({
		ids: DISTINCT_ITEMS
	});

	log.info(`${MODULE_ID} => ${esContentItems.length} items retrieved from elastic search api in ${Date.now() - START}ms`);

	esContentItems = esContentItems.filter(item => enrich(item));

//	console.log(esContentItems);

//	let contentItems = (await Promise.all(DISTINCT_ITEMS.map(async content_id => await getContentById(content_id))));
//
//	contentItems = contentItems.filter(item => Object.prototype.toString.call(item) === '[object Object]');

//	const items = contentItems.concat(cachedItems);

	log.info(`${MODULE_ID} => ${esContentItems.length}/${DISTINCT_ITEMS_LENGTH} items found in ${Date.now() - START}ms`);

	return esContentItems;
};
