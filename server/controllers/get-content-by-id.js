'use strict';

const path = require('path');

const { default: log } = require('@financial-times/n-logger');

const { DEFAULT_DOWNLOAD_FORMAT } = require('config');

const getContentById = require('../lib/get-content-by-id');

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

module.exports = exports = async (req, res, next) => {

	const { download_format } = res.locals.user;

	const format = req.query.format
				|| download_format
				|| DEFAULT_DOWNLOAD_FORMAT;

	let content = await getContentById(req.params.content_id, format);

	if (content) {
		res.status(200);

		content = cleanup(content);

		log.info(`${MODULE_ID} SUCCESS => `, content);

		res.json(content);

		next();
	}
	else {
		res.sendStatus(404);
	}
};

const REMOVE_PROPERTIES = [
	'document',
	'download'
];

function cleanup(content) {
	REMOVE_PROPERTIES.forEach(property => delete content[property]);

	return content;
}
