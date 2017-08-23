'use strict';

const path = require('path');

const { default: log } = require('@financial-times/n-logger');

const flagIsOn = require('../helpers/flag-is-on');

const getContent = require('../lib/get-content');
const getAllExistingItemsForContract = require('../lib/get-all-existing-items-for-contract');
const resolve = require('../lib/resolve');
const messageCode = require('../lib/resolve/messageCode');

const RESOLVE_PROPERTIES = Object.keys(resolve);

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

module.exports = exports = async (req, res, next) => {
	const START = Date.now();

	const { body } = req;

	const { locals: { contract, flags } } = res;

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

	const DISTINCT_ITEMS_LENGTH = DISTINCT_ITEMS.length;

	let items = await getContent(DISTINCT_ITEMS);

	items = items.filter(item => showItem(item, flags));

	log.info(`${MODULE_ID} => ${DISTINCT_ITEMS_LENGTH} distinct items found out of ${body.length} total items`);
	log.info(`${MODULE_ID} => Retrieved ${items.length}/${DISTINCT_ITEMS_LENGTH} distinct items in ${Date.now() - START}ms`);

	const existing = await getAllExistingItemsForContract(contract.contract_id);

	const response = items.map(item => RESOLVE_PROPERTIES.reduce((acc, prop) => {
		acc[prop] = resolve[prop](item[prop], prop, item, existing[item.id], contract);

		return acc;
	}, {}));

	response.forEach(item => messageCode(item, contract));

	if (req.query.test === 'messaging') {
		addTestStuff(response);
	}

	res.json(response);

	log.info(`${MODULE_ID} => Sent ${items.length}/${DISTINCT_ITEMS_LENGTH} distinct items in ${Date.now() - START}ms`);

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

function addTestStuff(response) {
	[
		['canBeSyndicated', 'no'],
		['canBeSyndicated', 'verify'],
		['canBeSyndicated', 'withContributorPayment'],
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

	return response;
}
