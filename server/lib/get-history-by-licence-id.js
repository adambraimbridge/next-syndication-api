'use strict';

//const path = require('path');

const moment = require('moment');

const { DOWNLOAD_STATE_MAP, SAVED_STATE_MAP } = require('config');

const HistoryTable = require('../../db/tables/history');
const { client } = require('../../db/connect');

//const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

module.exports = exports = async ({ include, licence_id, prep_aggregation = false, type, user_id }) => {
	let FilterExpression = 'licence_id = :licence_id';

	const ExpressionAttributeValues = {
		':licence_id': licence_id
	};

	if (user_id) {
		FilterExpression += ' and user_id = :user_id';

		ExpressionAttributeValues[':user_id'] = user_id;
	}

	let response = await client.scanAsync({
		TableName: HistoryTable.TableName,
		FilterExpression,
		ExpressionAttributeValues
	});

	if (response) {
		if (response.Count > 0) {
			// Sort items in descending order by `time:Date`
			// This is a schwartzian transform, if you don't know what that is
			// and/or why it's being used, I suggest you look it up.
			// DO NOT try and "simplify" — and thereby slow down the sort — if you do not understand what's going on.
			let items = response.Items.map(item => {
					return [+(new Date(item.time)), item];
				})
				.sort(([a], [b]) => b - a)
				.map(([, item]) => item);

			if (type) {
				let STATE_MAP = DOWNLOAD_STATE_MAP;

				switch (type) {
					case 'downloads':
						break;
					case 'saved':
						STATE_MAP = SAVED_STATE_MAP;
						break;
				}

				STATE_MAP = JSON.parse(JSON.stringify(STATE_MAP));

				if (include) {
					if (!Array.isArray(include)) {
						include = [include];
					}

					include.forEach(item => STATE_MAP[item] = true);
				}

				items = items.filter(item => STATE_MAP[item.item_state] === true);
			}

			items.forEach(item => {
				item.id = item.content_id.split('/').pop();

				const time = moment(item.time);
				item.date = time.format('DD MMMM YYYY');

				if (prep_aggregation === true) {
					item.aggregate = {
						year: time.format('YYYY'),
						month: time.format('M') - 1,
						week: time.format('W') - 1,
						day: time.format('DDD') - 1
					};
				}

				item.published = moment(item.published_date).format('DD MMMM YYYY');
			});

			return items;
		}
		else {
			return [];
		}
	}

	return null;
};
