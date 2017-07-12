'use strict';

const path = require('path');

const { default: log } = require('@financial-times/n-logger');
const fetch = require('n-eager-fetch');

const {
	SESSION_PRODUCTS_PATH,
	SESSION_URI,
	SYNDICATION_PRODUCT_CODE
} = require('config');

const skipChecks = require('../helpers/skip-checks');

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

module.exports = exports = async (req, res, next) => {
	try {
		const headers = { cookie: req.headers.cookie };

		delete headers.host;

		let isSyndicationUser = false;

		const sessionRes = await fetch(`${SESSION_URI}${SESSION_PRODUCTS_PATH}`, { headers });

		if (sessionRes.ok) {
			const session = await sessionRes.json();

			isSyndicationUser = session.uuid === res.locals.userUuid
								&& session.products.split(',').includes(SYNDICATION_PRODUCT_CODE);

			if (isSyndicationUser === true) {
				log.debug(`${MODULE_ID} IsSyndicationUserSuccess`, {
					isSyndicationUser,
					session
				});

				next();

				return;
			}
		}

		if (!sessionRes.ok) {
			if (skipChecks(res.locals.flags)) {
				next();

				return;
			}

			const error = await sessionRes.text();

			log.error(`${MODULE_ID} IsSyndicationUserFail =>`, {
				isSyndicationUser,
				error,
				httpStatus: sessionRes.status
			});
		}

		res.sendStatus(401);
	}
	catch (err) {
		log.error(`${MODULE_ID} IsSyndicationUserError =>`, {
			error: err.stack
		});

		res.sendStatus(503);

		throw err;
	}
};
