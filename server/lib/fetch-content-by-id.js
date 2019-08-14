'use strict';

const log = require('./logger');
const fetch = require('n-eager-fetch');

const {
	apikey: API_KEY,
	BASE_URI_FT_API
} = require('config');

module.exports = exports = async content_id => {
	const START = Date.now();

	const ARTICLE_URI = `${BASE_URI_FT_API}/content/${content_id}`;

	log.debug(`ATTEMPTING TO RETRIEVE ARTICLE => ${ARTICLE_URI}`);

	try {
		const res = await fetch(ARTICLE_URI, {
			timeout: 10000,
			headers: {
				'X-Api-Key': API_KEY
			}
		});

		if (res.status === 200) {
			log.debug(`ArticleRetrieveSuccess => ${ARTICLE_URI} in ${Date.now() - START}ms`, { res });

			return await res.json();
		} else {
			return await res.text();
		}
	}
	catch (error) {
		log.error({
			event: 'ARTICLE_RETRIEVE_ERROR',
			uri: ARTICLE_URI,
			error,
		});

		throw error;
	}
};
