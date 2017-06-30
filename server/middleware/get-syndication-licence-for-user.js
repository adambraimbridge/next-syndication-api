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
	try {
		const licenceRes = await fetch(`${BASE_URI_FT_API}/licences?userid=${res.locals.userUuid}`, {
			headers: { [API_KEY_HEADER_NAME]: ALS_API_KEY }
		});

		const licences = await licenceRes.json();

		const licenceList = licences[LICENCE_ITEMS_ARRAY_PROPERTY];

		const syndicationLicence = licenceList.find(({ products = [], status }) =>
						status === 'active' && products.find(({ code }) => code === SYNDICATION_PRODUCT_CODE));

		if (!syndicationLicence) {
			throw new ReferenceError(`${MODULE_ID} => No Syndication Licence found for user#${res.locals.userUuid}`);
		}

		res.locals.licence = syndicationLicence;

		log.info(`${MODULE_ID}`, syndicationLicence);

		next();
	}
	catch (error) {
		log.info(`${MODULE_ID}`, { error });

		res.sendStatus(503);

		throw error;
	}
};
