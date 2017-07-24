'use strict';

const path = require('path');

const { default: log } = require('@financial-times/n-logger');

const moment = require('moment');

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

				switch (req.query.type) {
					case 'downloads':
						items = items.filter(item => item.item_state !== 'save');
						break;
					case 'saved':
						items = items.filter(item => item.item_state === 'save');
						break;
				}

				items.forEach(item => {
					const user = LICENCE.usersMap[item.user_id];

					item.id = item.content_id.split('/').pop();

					item.date = moment(item.time).format('DD MMMM YYYY');

					if (user) {
						item.user_email = user.email;
						item.user_name = `${user.firstName} ${user.lastName}`;
					}
					else {
						if (res.locals.syndication_contract.rel === 'complimentary') {
							item.user_email = `${item.user_id.substring(0, 4)}.${item.user_id.substring(item.user_id.length - 4)}@complimentary.ft.com`;
							item.user_name = `${item.user_id.substring(0, 4)}...${item.user_id.substring(item.user_id.length - 4)}`;
						}
					}
				});

				res.json(items);
			}
			else {
				res.sendStatus(204);
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
