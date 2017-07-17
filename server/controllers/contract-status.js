'use strict';

const path = require('path');
//const util = require('util');

const { default: log } = require('@financial-times/n-logger');

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
		USERNAME: SALESFORCE_USERNAME,
		TEST_CONTRACT: SALESFORCE_TEST_CONTRACT
	}
} = require('config');

//const flagIsOn = require('../helpers/flag-is-on');

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

module.exports = exports = async (req, res, next) => {
	try {

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

		log.debug(`${MODULE_ID} | SALESFORCE OAUTH => `, oauth);

		const SALESFORCE_CONTRACT_ID = SALESFORCE_ENVIRONMENT === 'sandbox'
									? SALESFORCE_TEST_CONTRACT
									: res.locals.syndicationContractID;

		log.debug(`${MODULE_ID} | SALESFORCE CONTRACT URI => `, `${SALESFORCE_URI}/${SALESFORCE_CONTRACT_ID}`);

		let apexRes = await org.apexRest({
			uri:`${SALESFORCE_URI}/${SALESFORCE_CONTRACT_ID}`,
			method: 'GET',
			oauth: oauth
		});

		log.debug(`${MODULE_ID} | APEX RESPONSE => `, apexRes);

		if (apexRes) {
			if (apexRes.success === true) {
				res.status(200);
				res.json(apexRes);

				next();
			}
			else {
				res.status(400);
				res.json({
					error: apexRes.errorMessage
				});
			}
		}
		else {
			res.sendStatus(503);
		}

	}
	catch (error) {
		log.error(`${MODULE_ID}`, {
			error: error.stack
		});

		res.sendStatus(500);
	}
};
