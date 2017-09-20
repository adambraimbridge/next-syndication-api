'use strict';

const path = require('path');

//const mime = require('mime-types');

const esClient = require('@financial-times/n-es-client');
const { default: log } = require('@financial-times/n-logger');

//const pg = require('../../db/pg');

const enrich = require('./enrich');
//const formatArticleXML = require('./format-article-xml');
//const getWordCount = require('./get-word-count');
//const decorateArticle = require('./decorate-article');
//const toPlainText = require('./to-plain-text');

//const isMediaResource = require('../helpers/is-media-resource');

//const {
//	CONTENT_TYPE_ALIAS,
//	DOWNLOAD_ARCHIVE_EXTENSION,
//	DOWNLOAD_ARTICLE_FORMATS,
//	DOWNLOAD_FILENAME_PREFIX
//} = require('config');
//
//const RE_BAD_CHARS = /[^A-Za-z0-9_]/gm;
//const RE_SPACE = /\s/gm;

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

module.exports = exports = async (content_id, format) => {
	const START = Date.now();

	let content = await esClient.get(content_id);

	if (content) {
		content = enrich(content, format);
	}

	if (!content) {
		log.error(`${MODULE_ID} ContentNotFoundError => ${content_id}`);

		return content;
	}

	log.info(`${MODULE_ID} GetContentSuccess => ${content.content_id} in ${Date.now() - START}ms`);

	return content;
};
