'use strict';

const path = require('path');

const { default: log } = require('@financial-times/n-logger');
const fetch = require('n-eager-fetch');

const {
	ALS_API_KEY,
	API_KEY_HEADER_NAME,
	BASE_URI_FT_API,
	LICENCE_ITEMS_ARRAY_PROPERTY,
	SYNDICATION_PRODUCT_CODE,
	TEST: {
		SKIP_LICENCE_ID,
		SKIP_SYNDICATION_CONTRACT_ID
	}
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

		let syndicationLicences = licenceList.filter(({ products = [], status }) =>
						status === 'active' && products.find(({ code }) => code === SYNDICATION_PRODUCT_CODE));

		if (!syndicationLicences.length) {
			const isProduction = process.env.NODE_ENV === 'production;'
			if (isProduction) {
				throw new ReferenceError(`No Syndication Licence found for user#${res.locals.userUuid} using ${URI}`);
			}

			syndicationLicences.push({
				id: SKIP_LICENCE_ID,
				links: [{
					href: 'NULL',
					id: SKIP_SYNDICATION_CONTRACT_ID,
					rel: 'complimentary'
				}]
			});
		}

		let syndicationLicence = syndicationLicences.length === 1
								? syndicationLicences[0]
								: syndicationLicences.find(item => item.links[0].rel !== 'complimentary')
								|| syndicationLicences[0];

		if (!syndicationLicence) {
			throw new ReferenceError(`No Syndication Licence found for user#${res.locals.userUuid} using ${URI}`);
		}

		res.locals.licence = syndicationLicence;

		if (res.locals.MASQUERADING !== true || !res.locals.syndication_contract) {
			res.locals.syndication_contract = syndicationLicence.links[0];
		}

		log.info(`${MODULE_ID} LicenceFoundSuccess => ${URI}`, syndicationLicence);

		next();
	}
	catch (err) {
// todo: if user is in out system and no longer has an syndication contract, remove them from DB
		log.error(`${MODULE_ID} LicenceFoundError =>`, {
			error: err.stack,
			URI,
			headers,
			user: res.locals.userUuid
		});

		res.sendStatus(401);

		throw err;
	}
};
