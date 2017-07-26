'use strict';

const path = require('path');

const { default: log } = require('@financial-times/n-logger');

const moment = require('moment');

const { DOWNLOAD_STATE_MAP, SAVED_STATE_MAP } = require('config');

const HistoryTable = require('../../db/tables/history');
const { client } = require('../../db/connect');

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

module.exports = exports = async (req, res, next) => {
	try {
		const LICENCE = res.locals.licence;

		let FilterExpression = 'licence_id = :licence_id';
		const ExpressionAttributeValues = {
			':licence_id': LICENCE.id
		};

		if (req.query.show === 'mine') {
			FilterExpression += ' and user_id = :user_id';

			ExpressionAttributeValues[':user_id'] = res.locals.userUuid;
		}

		let response = await client.scanAsync({
			TableName: HistoryTable.TableName,
			FilterExpression,
			ExpressionAttributeValues
		});

		if (response) {
			if (response.Count > 0) {
				res.status(200);

				// Sort items in descending order by `time:Date`
				// This is a schwartzian transform, if you don't know what that is
				// and/or why it's being used, I suggest you look it up.
				// DO NOT try and "simplify" — and thereby slow down the sort — if you do not understand what's going on.
				let items = response.Items.map(item => {
						return [+(new Date(item.time)), item];
					})
					.sort(([a], [b]) => b - a)
					.map(([, item]) => item);

				if (req.query.type) {
					let STATE_MAP = DOWNLOAD_STATE_MAP;

					switch (req.query.type) {
						case 'downloads':
							break;
						case 'saved':
							STATE_MAP = SAVED_STATE_MAP;
							break;
					}

					STATE_MAP = JSON.parse(JSON.stringify(STATE_MAP));

					if (req.query.include) {
						if (!Array.isArray(req.query.include)) {
							req.query.include = [req.query.include];
						}

						req.query.include.forEach(item => STATE_MAP[item] = true);
					}

					items = items.filter(item => STATE_MAP[item.item_state] === true);
				}

				items.forEach(item => {
					item.id = item.content_id.split('/').pop();

					item.date = moment(item.time).format('DD MMMM YYYY');
					item.published = moment(item.published_date).format('DD MMMM YYYY');
				});

				res.json(items);
			}
			else {
				res.status(200);
				res.json([]);
			}
		}
		else {
			res.sendStatus(400);
		}

		next();
	}
	catch(error) {
		log.error(`${MODULE_ID}`, {
			error: error.stack
		});

		res.sendStatus(400);
	}
};
