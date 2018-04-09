'use strict';

const path = require('path');

const { default: log } = require('@financial-times/n-logger');
const fetch = require('n-eager-fetch');

const {
	apikey: API_KEY,
	BASE_URI_FT_API
} = require('config');

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

module.exports = exports = async content_id => {
	const START = Date.now();

	const ARTICLE_URI = `${BASE_URI_FT_API}/content/${content_id}`;

	log.debug(`${MODULE_ID} ATTEMPTING TO RETRIEVE ARTICLE => ${ARTICLE_URI}`);

	try {
		const res = await fetch(ARTICLE_URI, {
			timeout: 10000,
			headers: {
				'X-Api-Key': API_KEY
			}
		});

		if (res.status === 200) {
			log.debug(`${MODULE_ID} ArticleRetrieveSuccess => ${ARTICLE_URI} in ${Date.now() - START}ms`, { res });

			return await res.json();
		}

		if (res.status > 399) {
			log.error(`${MODULE_ID} ArticleRetrieveFail => ${ARTICLE_URI} in ${Date.now() - START}ms`, { res });
		}
		else {
			log.warn(`${MODULE_ID} ArticleRetrieveWarning => ${ARTICLE_URI} in ${Date.now() - START}ms`, { res });
		}

		return await res.text();
	}
	catch (err) {
		log.error(`${MODULE_ID} ArticleRetrieveError => ${ARTICLE_URI} in ${Date.now() - START}ms`, {
			error: err.stack
		});

		throw err;
	}
};
