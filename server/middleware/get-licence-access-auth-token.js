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

	const querystring = qs.stringify({
		'client_id': AUTH_API_CLIENT_ID,
		'redirect_uri': 'https://www.ft.com',
		'response_type': 'token',
		'scope': 'licence_data',
	});

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
			throw new ReferenceError(`No Licence Access Token returned for ${URI}`);
		}

		log.info(`${MODULE_ID} LicenceAccessTokenSuccess => ${URI}`, authQuery);

		res.locals.ACCESS_TOKEN_LICENCE = authQuery.access_token;

		next();
	}
	catch (err) {
		log.error(`${MODULE_ID} LicenceAccessTokenError`, {
			error: err.stack,
			URI
		});

		res.sendStatus(401);

		throw err;
	}
};
