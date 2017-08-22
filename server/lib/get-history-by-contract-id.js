'use strict';

const moment = require('moment');

const pg = require('../../db/pg');
const getAllExistingItemsForContract = require('./get-all-existing-items-for-contract');

module.exports = exports = async ({ contract_id, limit, offset, type, user_id }) => {
	const db = await pg();

	let query = 'SELECT * FROM syndication.';

	switch (type) {
		case 'saved':
			query += 'get_saved_items_by_contract_id(';
			break;
		default:
			query += 'get_downloads_by_contract_id(';
			break;
	}

	query += `$text$${contract_id}$text$::text`;

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
	const allExisting = await getAllExistingItemsForContract(contract_id);

	items.forEach(item => {
		let existing = allExisting[item.content_id];

		item.downloaded = existing.downloaded;
		item.saved = existing.saved;

		item.id = item.content_id.split('/').pop();

		item.date = moment(item.time).format('DD MMMM YYYY');

		item.published = moment(item.published_date).format('DD MMMM YYYY');
	});

	return items;
};
