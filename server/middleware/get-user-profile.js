'use strict';

const path = require('path');

const { default: log } = require('@financial-times/n-logger');
const fetch = require('n-eager-fetch');

const {
	ALS_API_KEY,
	API_KEY_HEADER_NAME,
	BASE_URI_FT_API,
	USER_PROFILE_DATA_PROPERTY
} = require('config');

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

module.exports = exports = async (req, res, next) => {
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

		const user = await userRes.json();

		if (!userRes.ok) {
			throw new Error(user.message || `${user.errors[0].message}: ${user.errors[0].errorCode}`);
		}

		log.debug(`${MODULE_ID} GetUserProfileSuccess => ${URI}`, user);

		res.locals.user = user[USER_PROFILE_DATA_PROPERTY];

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
