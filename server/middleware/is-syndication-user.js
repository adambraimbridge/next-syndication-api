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
		const { locals: {
			$DB: db,
			EXPEDITED_USER_AUTH,
			MAINTENANCE_MODE,
			userUuid
		} } = res;

		let isSyndicationUser = false;

		if (MAINTENANCE_MODE !== true) {
			if (EXPEDITED_USER_AUTH === true) {
				next();

				return;
			}

			const [dbUser] = await db.syndication.get_user([userUuid]);

			if (dbUser && dbUser.user_id === userUuid) {
				isSyndicationUser = true;

				if (isSyndicationUser === true) {
					log.info(`${MODULE_ID} IsSyndicationUserSuccess`, {
						isSyndicationUser
					});

					next();

					return;
				}
			}
		}

		const headers = { cookie: req.headers.cookie };
		const sessionRes = await fetch(`${SESSION_URI}${SESSION_PRODUCTS_PATH}`, { headers });

		if (sessionRes.ok) {
			const session = await sessionRes.json();

			isSyndicationUser = session.uuid === userUuid
								&& session.products.split(',').includes(SYNDICATION_PRODUCT_CODE);

			if (isSyndicationUser === true) {
				log.info(`${MODULE_ID} IsSyndicationUserSuccess`, {
					isSyndicationUser,
					session
				});

				next();

				return;
			}
		}

		if (!sessionRes.ok) {
			if (skipChecks()) {
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
