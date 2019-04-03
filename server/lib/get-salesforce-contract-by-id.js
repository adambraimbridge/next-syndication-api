'use strict';

const path = require('path');

const log = require('./logger');

const nforce = require('nforce');

const {
	SALESFORCE: {
		API_VERSION: SALESFORCE_API_VERSION,
		BASE_URI: SALESFORCE_URI,
		CALLBACK_URI: SALESFORCE_CALLBACK_URI,
		CLIENT_ID: SALESFORCE_CLIENT_ID,
		CLIENT_SECRET: SALESFORCE_CLIENT_SECRET,
		CONNECTION_MODE: SALESFORCE_CONNECTION_MODE,
		ENVIRONMENT: SALESFORCE_ENVIRONMENT,
		PASSWORD: SALESFORCE_PASSWORD,
		STUB_CONTRACTS: SALESFORCE_STUB_CONTRACTS,
		USERNAME: SALESFORCE_USERNAME
	}
} = require('config');

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

module.exports = exports = async (contractID, dontThrow) => {
	try {

		if (SALESFORCE_STUB_CONTRACTS.includes(contractID)) {
			log.info(`${MODULE_ID} | SALESFORCE DATA STUBBED FOR CONTRACT => `, contractID);
			return require(path.resolve(`./stubs/${contractID}.json`));
		}

		const org = nforce.createConnection({
			apiVersion: SALESFORCE_API_VERSION,
			autoRefresh: true,
			clientId: SALESFORCE_CLIENT_ID,
			clientSecret: SALESFORCE_CLIENT_SECRET,
			environment: SALESFORCE_ENVIRONMENT,
			mode: SALESFORCE_CONNECTION_MODE,
			redirectUri: SALESFORCE_CALLBACK_URI
		});

		const oauth = await org.authenticate({
			username: SALESFORCE_USERNAME,
			password: SALESFORCE_PASSWORD
		});

		log.info(`${MODULE_ID} | SALESFORCE OAUTH => `, oauth);

		log.info(`${MODULE_ID} | SALESFORCE CONTRACT URI => `, `${SALESFORCE_URI}/${contractID}`);

		let apexRes = await org.apexRest({
			uri: `${SALESFORCE_URI}/${contractID}`,
			method: 'GET',
			oauth: oauth
		});

		log.info(`${MODULE_ID} | APEX RESPONSE => `, apexRes);

		if (apexRes) {
			if (apexRes.success === true) {
				return apexRes;
			}
		}

		if (dontThrow === true) {
			return null;
		}

		throw new Error(`${MODULE_ID} => NullApexResponse`);
	}
	catch (error) {
		log.error(`${MODULE_ID}`, {
			error: error.stack
		});

		if (dontThrow === true) {
			return null;
		}

		throw error;
	}
};
