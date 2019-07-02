'use strict';


const log = require('../lib/logger');
const fetch = require('n-eager-fetch');

const {
	ALS_API_KEY,
	BASE_URI_FT_API
} = require('config');


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

			}
			else {
				log.warn({
					event: 'NO_USERS_FOUND_FOR_LICENCE',
					licenseId: res.locals.licence.id,
					contractId: res.locals.syndication_contract.id
				});
			}
		}
		else {
			const { errors: [{ errorCode, message }] } = await licenceRes.json();

			throw new Error(`${message}: ${errorCode}`);
		}
	}
	catch (error) {
		log.error({
			event: 'LICENCE_FOUND_ERROR',
			error: error,
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
