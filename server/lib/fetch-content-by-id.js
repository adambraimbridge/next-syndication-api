'use strict';

const { default: log } = require('@financial-times/n-logger');
const fetch = require('n-eager-fetch');

const {
	apikey: API_KEY,
	API_KEY_HEADER_NAME,
	BASE_URI_FT_API,
	TIMEOUT_ARTICLE_FETCH
} = require('config');

module.exports = exports = async content_id => {
	const ARTICLE_URI = `${BASE_URI_FT_API}/content/${content_id}`;

	log.debug(`ATTEMPTING TO RETRIEVE ARTICLE: ${ARTICLE_URI}`);

	try {
		const res = await fetch(ARTICLE_URI, {
			timeout: TIMEOUT_ARTICLE_FETCH,
			headers: {
				[API_KEY_HEADER_NAME]: API_KEY
			}
		});

		if (res.status === 200) {
			log.info(`SUCCESSFULLY RETRIEVED ARTICLE: ${ARTICLE_URI}`, res);

			return await res.json();
		}

		if (res.status > 399) {
			log.error(`RETRIEVE ARTICLE ERROR: ${ARTICLE_URI}`, res);
		}
		else {
			log.warn(`RETRIEVE ARTICLE WARNING: ${ARTICLE_URI}`, res);
		}

		return await res.text();
	}
	catch (err) {
		log.error(`ERROR TRYING TO RETRIEVE ARTICLE: ${ARTICLE_URI}`, err.stack);

		throw err;
	}
};
