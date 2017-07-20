'use strict';

const path = require('path');

const { default: log } = require('@financial-times/n-logger');
const fetch = require('n-eager-fetch');

const {
	ALS_API_KEY,
	API_KEY_HEADER_NAME,
	BASE_URI_FT_API
} = require('config');

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

module.exports = exports = async (req, res, next) => {
	const URI = `${BASE_URI_FT_API}/licence-seat-holders/${res.locals.licence.id}`;

	const headers = {
		'authorization': `Bearer ${res.locals.ACCESS_TOKEN_LICENCE}`,
		'content-type': 'application/json',
		[API_KEY_HEADER_NAME]: ALS_API_KEY
	};

	const LICENCE = res.locals.licence;

	try {
		const licenceRes = await fetch(URI, { headers });

		const { seatHolders } = await licenceRes.json();

		if (Array.isArray(seatHolders) && seatHolders.length) {
			LICENCE.users = seatHolders;

			LICENCE.usersMap = seatHolders.reduce((acc, item) => {
				acc[item.id] = item;

				return acc;
			}, {});
		}
	}
	catch (err) {
		log.error(`${MODULE_ID} LicenceFoundError =>`, {
			error: err.stack,
			URI,
			headers,
			user: res.locals.userUuid
		});

		if (res.locals.syndication_contract.rel !== 'complimentary') {
			res.sendStatus(401);
		}
	}

	if (!Array.isArray(LICENCE.users)) {
		LICENCE.users = [];
		LICENCE.usersMap = {};
	}

	next();
};
