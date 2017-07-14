'use strict';

const path = require('path');
//const util = require('util');

const { default: log } = require('@financial-times/n-logger');

const nforce = require('nforce');

const {
	SALESFORCE: {
		BASE_URI: SALESFORCE_URI,
		CLIENT_ID: SALESFORCE_CLIENT_ID,
		CLIENT_SECRET: SALESFORCE_CLIENT_SECRET,
		CALLBACK_URI: SALESFORCE_CALLBACK_URI,
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
			clientId: SALESFORCE_CLIENT_ID,
			clientSecret: SALESFORCE_CLIENT_SECRET,
			redirectUri: SALESFORCE_CALLBACK_URI,
			environment: SALESFORCE_ENVIRONMENT
		});

		const oauth = await org.authenticate({ username: SALESFORCE_USERNAME, password: SALESFORCE_PASSWORD });

		log.debug(`${MODULE_ID} => `, oauth);
		log.debug(`${MODULE_ID} => `, `${SALESFORCE_URI}/${res.locals.syndicationContractID}`);
		log.debug(`${MODULE_ID} => `, `${SALESFORCE_URI}/${SALESFORCE_TEST_CONTRACT}`);

		let apexRes = await org.apexRest({
			uri:'process-sf-external-inbound-msgs',
			method: 'POST',
			oauth: oauth
		});

		log.debug(`${MODULE_ID} => apexRes = ${apexRes}`);

		let uriRes = await org.getUrl({
			oauth,
//			url: `${SALESFORCE_URI}/${res.locals.syndicationContractID}`
			url: `${SALESFORCE_URI}/${SALESFORCE_TEST_CONTRACT}`
		});

		log.debug(`${MODULE_ID} => `, uriRes);
//
//		let responses = await [
//			'getRecord',
//			'getResources',
//			'getSObjects'
//		].map(async fn => await org[fn]());
//
//		console.log(responses);

		next();
	}
	catch (error) {
		log.error(`${MODULE_ID}`, {
			error: error.stack
		});

		res.sendStatus(500);
	}
};
