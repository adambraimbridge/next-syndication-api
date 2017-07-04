'use strict';

const path = require('path');
const url = require('url');

const { default: log } = require('@financial-times/n-logger');

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

	const items = (await Promise.all(DISTINCT_ITEMS.map(async content_id => await fetchContentById(content_id)))).filter(item => Object.prototype.toString.call(item) === '[object Object]');

	log.info(`${MODULE_ID} => ${DISTINCT_ITEMS.length} distinct items found out of ${body.length} total items`);
	log.info(`${MODULE_ID} => Retrieved ${items.length}/${DISTINCT_ITEMS.length} distinct items in ${Date.now() - START}ms`);

	const response = items.map(item => RESOLVE_PROPERTIES.reduce((acc, prop) => {
		acc[prop] = resolve[prop](item[prop]);

		return acc;
	}, {}));

	res.json(response);

	log.info(`${MODULE_ID} => Sent ${items.length}/${DISTINCT_ITEMS.length} distinct items in ${Date.now() - START}ms`);

	next();
};
