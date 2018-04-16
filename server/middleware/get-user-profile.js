'use strict';

const path = require('path');

const { default: log } = require('@financial-times/n-logger');
const fetch = require('n-eager-fetch');

const usersColumnMappings = require('../../db/pg/column_mappings/users');
const pgMapColumns = require('../../db/pg/map-columns');

const {
	ALS_API_KEY,
	BASE_URI_FT_API
} = require('config');

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

module.exports = exports = async (req, res, next) => {
	const { locals: {
		ACCESS_TOKEN_LICENCE,
		ACCESS_TOKEN_USER,
		EXPEDITED_USER_AUTH,
		MAINTENANCE_MODE,
		userUuid
	} } = res;

	if (MAINTENANCE_MODE !== true && EXPEDITED_USER_AUTH === true) {
		next();

		return;
	}

	const URI = `${BASE_URI_FT_API}/users/${userUuid}/profile`;

	const headers = {
		'authorization': `Bearer ${ACCESS_TOKEN_USER || ACCESS_TOKEN_LICENCE}`,
		'cookie': req.headers.cookie,
		'content-type': 'application/json',
		'X-Api-Key': ALS_API_KEY
	};

	try {
		const userRes = await fetch(URI, {
			headers,
			method: 'get'
		});

		const userProfile = await userRes.json();

		if (!userRes.ok) {
			throw new Error(userProfile.message || `${userProfile.errors[0].message}: ${userProfile.errors[0].errorCode}`);
		}

		log.info(`${MODULE_ID} GetUserProfileSuccess => ${URI}`, userProfile.user);

		const user = pgMapColumns(JSON.parse(JSON.stringify(userProfile.user)), usersColumnMappings);

		if (MAINTENANCE_MODE !== true) {
			const { $DB: db } = res.locals;

			const [user_data] = await db.syndication.upsert_user([user]);

			res.locals.user = user_data;
		}
		else {
			res.locals.user = user;
		}

		log.info(`${MODULE_ID} Upsert User => `, res.locals.user);

		next();
	}
	catch (err) {
		log.error(`${MODULE_ID} GetUserProfileError =>`, {
			error: err.stack,
			URI,
			headers,
			user: userUuid
		});

		res.sendStatus(401);

		throw err;
	}
};
