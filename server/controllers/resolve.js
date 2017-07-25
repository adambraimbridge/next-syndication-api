'use strict';

const path = require('path');

const { default: log } = require('@financial-times/n-logger');

const HistoryTable = require('../../db/tables/history');
const { client } = require('../../db/connect');

const flagIsOn = require('../helpers/flag-is-on');

const fetchContentById = require('../lib/fetch-content-by-id');
const resolve = require('../lib/resolve');

const RESOLVE_PROPERTIES = Object.keys(resolve);

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

module.exports = exports = async (req, res, next) => {
	const START = Date.now();

	let { body } = req;

	if (!Array.isArray(body)) {
		log.error(`${MODULE_ID} Expected \`req.body\` to be [object Array] and got \`${Object.prototype.toString.call(body)}\` instead`);

		return res.sendStatus(400);
	}

	if (!body.length) {
		log.error(`${MODULE_ID} \`req.body\` does not contain any content IDs`);

		return res.sendStatus(400);
	}

	const DISTINCT_ITEMS = Object.keys(body.reduce((acc, id) => {
		acc[id] = id;

		return acc;
	}, {}));

	let items = (await Promise.all(DISTINCT_ITEMS.map(async content_id => await fetchContentById(content_id)))).filter(item => Object.prototype.toString.call(item) === '[object Object]');

	items = items.filter(item => showItem(item, res.locals.flags));

	log.info(`${MODULE_ID} => ${DISTINCT_ITEMS.length} distinct items found out of ${body.length} total items`);
	log.info(`${MODULE_ID} => Retrieved ${items.length}/${DISTINCT_ITEMS.length} distinct items in ${Date.now() - START}ms`);

	let saved = await client.scanAsync({
		TableName: HistoryTable.TableName,
		FilterExpression: 'licence_id = :licence_id and item_state = :item_state',
		ExpressionAttributeValues: {
			':item_state': 'save',
			':licence_id': res.locals.licence.id
		}
	});

	if (saved.Count > 0) {
		saved.ItemsMap = saved.Items.reduce((acc, item) => {
			acc[item.content_id] = item;

			return acc;
		}, {});
	}
	else {
		saved.ItemsMap = {};
	}

	const response = items.map(item => RESOLVE_PROPERTIES.reduce((acc, prop) => {
		acc[prop] = resolve[prop](item[prop], prop, item, saved.ItemsMap[item.id]);

		return acc;
	}, {}));

	res.json(response);

	log.info(`${MODULE_ID} => Sent ${items.length}/${DISTINCT_ITEMS.length} distinct items in ${Date.now() - START}ms`);

	next();
};

function showItem(item, flags) {
	let { type } = item;

	type = type.split('/').pop().toLowerCase();

	if (type === 'article') {
		return true;
	}

	if (type === 'mediaresource' || type === 'video' || type === 'podcast') {
		return flagIsOn(flags.syndicationDownloadMediaResource);
	}

	if (type === 'package') {
		return flagIsOn(flags.syndicationDownloadPackage);
	}

	if (type === 'placeholder') {
		return flagIsOn(flags.syndicationDownloadPlaceholder);
	}
}
