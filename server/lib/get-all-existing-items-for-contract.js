'use strict';

const path = require('path');

const { default: log } = require('@financial-times/n-logger');

const pg = require('../../db/pg');

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

module.exports = exports = async (contract_id) => {
	const db = await pg();

	let alreadyDownloaded = await db.run(`SELECT * FROM syndication.get_downloads_by_contract_id($text$${contract_id}$text$::text)`);

	log.info(`${MODULE_ID} => ${alreadyDownloaded.length} downloaded items found`);

	let alreadySaved = await db.run(`SELECT * FROM syndication.get_saved_items_by_contract_id($text$${contract_id}$text$::text)`);

	log.info(`${MODULE_ID} => ${alreadySaved.length} saved items found`);

	let items = alreadyDownloaded.reduce((acc, item) => {
		acc[item.content_id] = item;

		item.downloaded = true;

		return acc;
	}, {});

	items = alreadySaved.reduce((acc, item) => {
		if (!(item.content_id in acc)) {
			acc[item.content_id] = item;
		}

		acc[item.content_id].saved = true;

		return acc;
	}, items);

	return items;
};
