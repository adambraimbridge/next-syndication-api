'use strict';

const pg = require('../../db/pg');

module.exports = exports = async (contract_id) => {
	const db = await pg();

	const alreadyDownloaded = await db.run(`SELECT * FROM syndication.get_downloads_by_contract_id($text$${contract_id}$text$::text)`);

	const alreadySaved = await db.run(`SELECT * FROM syndication.get_saved_items_by_contract_id($text$${contract_id}$text$::text)`);

	let items = alreadyDownloaded.reduce((acc, item) => {
		acc[item.content_id] = item;

		if (item.content_id.startsWith('http')) {
			acc[item.content_id.split('/').pop()] = item;
		}

		item.downloaded = true;

		return acc;
	}, {});

	items = alreadySaved.reduce((acc, item) => {
		if (!(item.content_id in acc)) {
			acc[item.content_id] = item;

			if (item.content_id.startsWith('http')) {
				acc[item.content_id.split('/').pop()] = item;
			}
		}

		acc[item.content_id].saved = true;

		return acc;
	}, items);

	return items;
};
