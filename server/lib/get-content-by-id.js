'use strict';


const esClient = require('@financial-times/n-es-client');
const log = require('./logger');

const pg = require('../../db/pg');

const enrich = require('./enrich');


module.exports = exports = async (contentId, format, lang) => {

	let content;

	try {
		if (lang === 'es') {
			const db = await pg();

			[content] = await db.syndication.get_content_es_by_id([contentId]);

			const contentEN = await esClient.get(contentId);

			[
				'id', 'canBeSyndicated',
				'firstPublishedDate', 'publishedDate',
				'url', 'webUrl'
			].forEach(prop => content[prop] = contentEN[prop]);

			content.lang = lang;
		}
		else {
			content = await esClient.get(contentId);
		}
	}
	catch (e) {
		content = null;
	}

	if (content) {
		try {
			content = enrich(content, format);

			log.info({
				event: 'GET_CONTENT_SUCCESS',
				contentId
			})
		}
		catch (error) {
			log.error({
				contentId,
				error
			});

			content = null;
		}
	}

	return content;
};
