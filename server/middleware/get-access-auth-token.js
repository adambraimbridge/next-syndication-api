'use strict';

const path = require('path');
const qs = require('querystring');

const { default: log } = require('@financial-times/n-logger');
const fetch = require('n-eager-fetch');

const {
	AUTH_API_CLIENT_ID,
	AUTH_API_ID_PROPERTY,
	AUTH_API_QUERY,
	BASE_URI_FT_API
} = require('config');

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

module.exports = exports = async (req, res, next) => {
	try {
		const query = Object.assign({
			[AUTH_API_ID_PROPERTY]: AUTH_API_CLIENT_ID
		}, AUTH_API_QUERY);

		log.info(`${BASE_URI_FT_API}/authorize?${qs.stringify(query)}`);

		const authRes = await fetch(`${BASE_URI_FT_API}/authorize?${qs.stringify(query)}`, {
			headers: {
				'cookie': req.headers.cookie,
				'content-type': 'application/json'
			},
			method: 'get'
		});

		const authQuery = qs.parse(authRes.url.split('#').pop());

		if (!authQuery.access_token) {
			return res.sendStatus(401);
		}

		res.locals.ACCESS_TOKEN = authQuery.access_token;

		next();
	}
	catch (error) {
		log.info(`${MODULE_ID}`, { error });

		res.sendStatus(401);

		throw error;
	}
};
