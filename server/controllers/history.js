'use strict';

const path = require('path');

const { default: log } = require('@financial-times/n-logger');

const HistoryTable = require('../../db/tables/history');
const { client } = require('../../db/connect');

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

module.exports = exports = async (req, res, next) => {
	try {
		let response = await client.scanAsync({
			TableName: HistoryTable.TableName,
			FilterExpression: 'licence_id = :licence_id',
			ExpressionAttributeValues: {
				':licence_id': res.locals.licence.id
			}
		});

		if (response && Array.isArray(response.Items)) {
			if (response.Items.length) {
				res.status(200);

				res.json(response.Items);
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
