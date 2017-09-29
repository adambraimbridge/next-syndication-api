'use strict';

const path = require('path');

const { default: log } = require('@financial-times/n-logger');
const fetch = require('n-eager-fetch');

const usersColumnMappings = require('../../db/pg/column_mappings/users');
const pgMapColumns = require('../../db/pg/map-columns');

const {
	ALS_API_KEY,
	API_KEY_HEADER_NAME,
	BASE_URI_FT_API,
	USER_PROFILE_DATA_PROPERTY
} = require('config');

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

module.exports = exports = async (req, res, next) => {
	const { locals: { EXPEDITED_USER_AUTH } } = res;

	if (EXPEDITED_USER_AUTH === true) {
		next();

		return;
	}

	const URI = `${BASE_URI_FT_API}/users/${res.locals.userUuid}/profile`;

	const headers = {
		'authorization': `Bearer ${res.locals.ACCESS_TOKEN_USER || res.locals.ACCESS_TOKEN_LICENCE}`,
		'cookie': req.headers.cookie,
		'content-type': 'application/json',
		[API_KEY_HEADER_NAME]: ALS_API_KEY
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

		log.info(`${MODULE_ID} GetUserProfileSuccess => ${URI}`, userProfile[USER_PROFILE_DATA_PROPERTY]);

		res.locals.user = userProfile[USER_PROFILE_DATA_PROPERTY];

		const user = pgMapColumns(JSON.parse(JSON.stringify(res.locals.user)), usersColumnMappings);

		const { $DB: db } = res.locals;

		const [user_data] = await db.syndication.upsert_user([user]);

		res.locals.user = user_data;

		if (res.locals.FT_User) {
			res.locals.user.passport_id = res.locals.FT_User.USERID || user_data.user_id;
		}

		log.info(`${MODULE_ID} Upsert User => `, user_data);

		next();
	}
	catch (err) {
		log.error(`${MODULE_ID} GetUserProfileError =>`, {
			error: err.stack,
			URI,
			headers,
			user: res.locals.userUuid
		});

		res.sendStatus(401);

		throw err;
	}
};
