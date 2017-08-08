'use strict';

const path = require('path');

const { default: log } = require('@financial-times/n-logger');

const HistoryTable = require('../../db/tables/history');
const { client } = require('../../db/connect');

const flagIsOn = require('../helpers/flag-is-on');

const fetchContentById = require('../lib/fetch-content-by-id');
const resolve = require('../lib/resolve');

const {
	DOWNLOAD_STATE_MAP,
	SAVED_STATE_MAP
} = require('config');

const RESOLVE_PROPERTIES = Object.keys(resolve);

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

module.exports = exports = async (req, res, next) => {
	const START = Date.now();

	let { body } = req;

	const { locals: { contract, flags, licence } } = res;

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

	items = items.filter(item => showItem(item, flags));

	log.info(`${MODULE_ID} => ${DISTINCT_ITEMS.length} distinct items found out of ${body.length} total items`);
	log.info(`${MODULE_ID} => Retrieved ${items.length}/${DISTINCT_ITEMS.length} distinct items in ${Date.now() - START}ms`);

	let existing = await client.scanAsync({
		TableName: HistoryTable.TableName,
		FilterExpression: 'licence_id = :licence_id',
		ExpressionAttributeValues: {
			':licence_id': licence.id
		}
	});

	if (existing.Count > 0) {
		existing.ItemsMap = existing.Items.reduce((acc, item) => {
			if (item.item_state in DOWNLOAD_STATE_MAP || item.item_state in SAVED_STATE_MAP) {
				acc[item.content_id] = item;
			}

			return acc;
		}, {});
	}
	else {
		existing.ItemsMap = {};
	}

	const response = items.map(item => RESOLVE_PROPERTIES.reduce((acc, prop) => {
		acc[prop] = resolve[prop](item[prop], prop, item, existing.ItemsMap[item.id], contract);

		return acc;
	}, {}));

	if (req.query.test === 'messaging') {
		[
			['canBeSyndicated', 'no'],
			['canBeSyndicated', 'verify'],
			['canBeSyndicated', 'yes'],
			['canBeSyndicated', null],
			['canDownload', 1],
			['canDownload', 0],
			['canDownload', -1],
			['downloaded', true],
			['downloaded', false],
			['saved', true],
			['saved', false]
		].forEach(([key, val], i) => response[i][key] = val);
	}

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
