'use strict';

const path = require('path');

const { default: log } = require('@financial-times/n-logger');
const fetch = require('n-eager-fetch');

const {
	SESSION_PRODUCTS_PATH,
	SESSION_URI,
	SYNDICATION_PRODUCT_CODE
} = require('config');

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

module.exports = exports = async (req, res, next) => {
	try {
		const headers = { cookie: req.headers.cookie }; //JSON.parse(JSON.stringify(req.headers));

		delete headers.host;

		let isSyndicationUser = false;

		const sessionRes = await fetch(`${SESSION_URI}${SESSION_PRODUCTS_PATH}`, { headers });

		if (!sessionRes.ok) {
			const error = await sessionRes.text();

			log.info(`${MODULE_ID}`, { isSyndicationUser, error, httpStatus: sessionRes.status });

			res.sendStatus(401);

			return;
		}

		const session = await sessionRes.json();

		isSyndicationUser = session.uuid === res.locals.userUuid
						&& session.products.split(',').includes(SYNDICATION_PRODUCT_CODE);

		log.info(`${MODULE_ID}`, { isSyndicationUser, session });

		if (isSyndicationUser !== true) {
			res.sendStatus(401);
		}
		else {
			next();
		}
	}
	catch (error) {
		log.info(`${MODULE_ID}`, { error });

		res.sendStatus(503);

		throw error;
	}
};
