'use strict';

const log = require('../lib/logger');
const fetch = require('n-eager-fetch');
const createAuthorizationQueryString = require("../helpers/create-authorization-query-string");

const { BASE_URI_FT_API } = require('config');

module.exports = exports = async (req, res, next) => {
	const querystring = createAuthorizationQueryString('licence_data');

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

		res.locals.ACCESS_TOKEN_LICENCE = authQuery.access_token;

		next();
	}
	catch (error) {
		log.error({
			event: 'LICENCE_ACCESS_TOKEN_ERROR',
			error,
			URI
		});

		res.sendStatus(401);

		throw error;
	}
};
