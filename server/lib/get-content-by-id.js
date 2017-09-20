'use strict';

const path = require('path');

const esClient = require('@financial-times/n-es-client');
const { default: log } = require('@financial-times/n-logger');

const enrich = require('./enrich');

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

module.exports = exports = async (content_id, format) => {
	const START = Date.now();

	let content;

	try {
		content = await esClient.get(content_id);
	}
	catch (e) {
		content = null;
	}

	if (!content) {
		log.error(`${MODULE_ID} ContentNotFoundError => ${content_id}`);
	}
	else {
		try {
			content = enrich(content, format);

			log.info(`${MODULE_ID} GetContentSuccess => ${content.content_id} in ${Date.now() - START}ms`);
		}
		catch (e) {
			log.error(`${MODULE_ID} ContentTypeNotSupportedError => ${content_id}`);

			content = null;
		}
	}

	return content;
};
