'use strict';

const { DEFAULT_DOWNLOAD_FORMAT } = require('config');

const getContentById = require('../lib/get-content-by-id');

module.exports = exports = async (req, res, next) => {

	const { download_format } = res.locals.user;

	const format = req.query.format
				|| download_format
				|| DEFAULT_DOWNLOAD_FORMAT;

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
	'document',
	'download'
];

function cleanup(content) {
	REMOVE_PROPERTIES.forEach(property => delete content[property]);

	return content;
}
