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

module.exports = exports = (req, res, next) => {
	const headers = { cookie: req.headers.cookie }; //JSON.parse(JSON.stringify(req.headers));

	delete headers.host;

	let isSyndicationUser = false;

	return new Promise((resolve, reject) => {
		fetch(`${SESSION_URI}${SESSION_PRODUCTS_PATH}`, { headers })
		.then(sessionRes => {
			if (!sessionRes.ok) {
				sessionRes.text().then(error => {
					log.info(`${MODULE_ID}`, { isSyndicationUser, error, httpStatus: sessionRes.status });

					res.sendStatus(401);

					resolve({ isSyndicationUser, error, httpStatus: sessionRes.status });
				});

				return;
			}

			sessionRes.json().then(session => {
				isSyndicationUser = session.uuid === res.locals.userUuid
								&& session.products.split(',').includes(SYNDICATION_PRODUCT_CODE);

				log.info(`${MODULE_ID}`, { isSyndicationUser, session });

				if (isSyndicationUser !== true) {
					res.sendStatus(401);

					resolve({ isSyndicationUser });
				}
				else {
					resolve({ isSyndicationUser });

					next();
				}
			});
		})
		.catch(error => {
			log.info(`${MODULE_ID}`, { error });

			res.sendStatus(503);

			reject(error);
		});
	});
};
