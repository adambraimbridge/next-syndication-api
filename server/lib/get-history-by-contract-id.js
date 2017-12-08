'use strict';

const moment = require('moment');

const pg = require('../../db/pg');
const getAllExistingItemsForContract = require('./get-all-existing-items-for-contract');

module.exports = exports = async ({ contract_id, limit, offset, type, user_id }) => {
	const db = await pg();

	let query = 'SELECT * FROM syndication.';
	let totalQuery = 'SELECT count(*) FROM syndication.';

	switch (type) {
		case 'saved':
			query += 'get_saved_items_by_contract_id(';
			totalQuery += 'saved_items';

			break;
		default:
			query += 'get_downloads_by_contract_id(';
			totalQuery += 'downloads';

			break;
	}

	query += `$text$${contract_id}$text$::text`;

	totalQuery += ` history WHERE history.contract_id = '${contract_id}'`;

	if (typeof user_id !== 'undefined') {
		query += `, $text$${user_id}$text$::text`;
	}

	if (typeof offset !== 'undefined') {
		query += `, $integer$${offset}$integer$::integer`;
	}

	if (typeof limit !== 'undefined') {
		query += `, $integer$${limit}$integer$::integer`;
	}

	query += ');';

	const items = await db.run(query);
	const [totalRes] = await db.run(totalQuery);
	const total = parseInt(totalRes.count, 10);
	const allExisting = await getAllExistingItemsForContract(contract_id);

	await items.filter(item => item.iso_lang_code === 'es').forEach(async item => {
		const query = `SELECT * FROM syndication.get_content_es_by_id($text$${item.content_id}$text$)`;
		const [content] = await db.run(query);
		item.content_area = content.content_area;
	});

	items.forEach(item => {
		const existing = allExisting[item.content_id];

		item.downloaded = existing.downloaded;
		item.saved = existing.saved;

		item.id = item.content_id.split('/').pop();

		item.date = moment(item.time).format('DD MMMM YYYY');

		item.published = moment(item.published_date).format('DD MMMM YYYY');
	});

	return { items, total };
};
