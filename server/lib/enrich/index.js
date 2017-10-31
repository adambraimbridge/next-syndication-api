'use strict';

const path = require('path');

const { default: log } = require('@financial-times/n-logger');

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

module.exports = exports = function enrich(content, format) {
	if (!content.type && content.content_type) {
		content.type = content.content_type;
	}

	if (Object.prototype.toString.call(content) === '[object Object]' && !(content instanceof Error) && content.type in exports) {
		const START = Date.now();

		content = exports[content.type](content, format);

		log.debug(`${MODULE_ID} Enrich ${content.type} in ${Date.now() - START}ms`);

		return content;
	}

	return null;
};

exports.article = require('./article');
exports.podcast = require('./podcast');
exports.video = require('./video');
exports.package = require('./package');
