'use strict';

const path = require('path');

const { default: log } = require('@financial-times/n-logger');
const fetch = require('n-eager-fetch');

const {
	ALS_API_KEY,
	API_KEY_HEADER_NAME,
	BASE_URI_FT_API,
	LICENCE_ITEMS_ARRAY_PROPERTY,
	SYNDICATION_PRODUCT_CODE
} = require('config');

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

module.exports = exports = async (req, res, next) => {
	const URI = `${BASE_URI_FT_API}/licences?userid=${res.locals.userUuid}`;
	const headers = {
		[API_KEY_HEADER_NAME]: ALS_API_KEY
	};

	try {
		const licenceRes = await fetch(URI, { headers });

		const licences = await licenceRes.json();

		const licenceList = licences[LICENCE_ITEMS_ARRAY_PROPERTY];

		const syndicationLicence = licenceList.find(({ products = [], status }) =>
						status === 'active' && products.find(({ code }) => code === SYNDICATION_PRODUCT_CODE));

		if (!syndicationLicence) {
			throw new ReferenceError(`No Syndication Licence found for user#${res.locals.userUuid} using ${URI}`);
		}

		res.locals.licence = syndicationLicence;

		log.debug(`${MODULE_ID} LicenceFoundSuccess => ${URI}`, syndicationLicence);

		next();
	}
	catch (err) {
		log.error(`${MODULE_ID} LicenceFoundError =>`, {
			error: err.stack,
			URI,
			headers,
			user: res.locals.userUuid
		});

		res.sendStatus(503);

		throw err;
	}
};
