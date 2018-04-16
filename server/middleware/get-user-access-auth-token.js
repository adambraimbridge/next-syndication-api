'use strict';

const path = require('path');
const qs = require('querystring');

const { default: log } = require('@financial-times/n-logger');
const fetch = require('n-eager-fetch');

const {
	AUTH_API_CLIENT_ID,
	BASE_URI_FT_API
} = require('config');

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

module.exports = exports = async (req, res, next) => {
	const { locals: {
		EXPEDITED_USER_AUTH,
		MAINTENANCE_MODE
	} } = res;

	if (MAINTENANCE_MODE !== true && EXPEDITED_USER_AUTH === true) {
		next();

		return;
	}

	const querystring = qs.stringify({
		'client_id': AUTH_API_CLIENT_ID,
		'redirect_uri': 'https://www.ft.com',
		'response_type': 'token',
		'scope': 'profile_min',
	})

	const URI = `${BASE_URI_FT_API}/authorize?${querystring}`;

	try {
		const authRes = await fetch(URI, {
			headers: {
				'cookie': req.headers.cookie,
				'content-type': 'application/json'
			},
			method: 'get'
		});

		const authQuery = qs.parse(authRes.url.split('#').pop());

		if (!authQuery.access_token) {
			throw new ReferenceError(`No User Access Token returned for ${URI}`);
		}

		log.info(`${MODULE_ID} UserAccessTokenSuccess => ${URI}`, authQuery);

		res.locals.ACCESS_TOKEN_USER = authQuery.access_token;

		next();
	}
	catch (err) {
		log.error(`${MODULE_ID} UserAccessTokenError`, {
			error: err.stack,
			URI
		});

		res.sendStatus(401);

		throw err;
	}
};
