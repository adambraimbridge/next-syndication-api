'use strict';

const path = require('path');

const { default: log } = require('@financial-times/n-logger');
const fetch = require('n-eager-fetch');

const {
	ALS_API_KEY,
	BASE_URI_FT_API
} = require('config');

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

module.exports = exports = async (req, res, next) => {
	const URI = `${BASE_URI_FT_API}/licence-seat-holders/${res.locals.licence.id}`;

	const headers = {
		'authorization': `Bearer ${res.locals.ACCESS_TOKEN_LICENCE}`,
		'content-type': 'application/json',
		'X-Api-Key': ALS_API_KEY
	};

	const LICENCE = res.locals.licence;

	try {
		const licenceRes = await fetch(URI, { headers });

		if (licenceRes.ok) {
			const { seatHolders } = await licenceRes.json();

			if (Array.isArray(seatHolders) && seatHolders.length) {
				LICENCE.users = seatHolders;

				LICENCE.usersMap = seatHolders.reduce((acc, item) => {
					acc[item.id] = item;

					return acc;
				}, {});

				log.info(`${MODULE_ID} => Found ${seatHolders.length} users for licence#${res.locals.licence.id}; contract#${res.locals.syndication_contract.id}`);
			}
			else {
				log.warn(`${MODULE_ID} => Found NO users for licence#${res.locals.licence.id}; contract#${res.locals.syndication_contract.id}`);
			}
		}
		else {
			const { errors: [{ errorCode, message }] } = await licenceRes.json();

			throw new Error(`${message}: ${errorCode}`);
		}
	}
	catch (err) {
		log.error(`${MODULE_ID} LicenceFoundError =>`, {
			error: err.stack,
			URI,
			headers,
			user: res.locals.userUuid,
			licenceId: LICENCE.id
		});

		if (res.locals.syndication_contract.rel !== 'complimentary') {
			res.sendStatus(401);

			return;
		}
	}

	if (!Array.isArray(LICENCE.users)) {
		LICENCE.users = [];
		LICENCE.usersMap = {};
	}

	next();
};
