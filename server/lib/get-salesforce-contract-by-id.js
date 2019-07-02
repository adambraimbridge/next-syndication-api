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

module.exports = exports = async (contractId, dontThrow) => {
	try {

		if (SALESFORCE_STUB_CONTRACTS.includes(contractId)) {
			log.info({
				event: 'SALESFORCE_DATA_STUBBED_FOR_CONTRACT',
				contractId
			});
			return require(path.resolve(`./stubs/${contractId}.json`));
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

		let apexRes = await org.apexRest({
			uri: `${SALESFORCE_URI}/${contractId}`,
			method: 'GET',
			oauth: oauth
		});

		if (apexRes) {
			if (apexRes.success === true) {
				return apexRes;
			}
		}

		if (dontThrow === true) {
			return null;
		}

		throw new Error('NullApexResponse');
	}
	catch (error) {
		log.error(error);

		if (dontThrow === true) {
			return null;
		}

		throw error;
	}
};
