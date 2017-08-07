'use strict';

//const path = require('path');

//const { default: log } = require('@financial-times/n-logger');

const { DEFAULT_DOWNLOAD_FORMAT } = require('config');

const getContentById = require('../lib/get-content-by-id');

//const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

module.exports = exports = async (req, res, next) => {

	const { download_formats } = res.locals.contract;

	const format = req.query.format
				|| (download_formats
				? download_formats[res.locals.user.id]
				|| DEFAULT_DOWNLOAD_FORMAT
				: DEFAULT_DOWNLOAD_FORMAT);

	const content = await getContentById(req.params.content_id, format);

	if (content) {
		res.status(200);

		res.json(cleanup(content));

		next();
	}
	else {
		res.sendStatus(404);
	}
};

const REMOVE_PROPERTIES = [
	'__doc',
	'download'
];

function cleanup(content) {
	REMOVE_PROPERTIES.forEach(property => delete content[property]);

	return content;
}
