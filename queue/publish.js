'use strict';

const path = require('path');

require('./promisify');

const log = require('@financial-times/n-logger').default;

const AWS = require('aws-sdk');

const { AWS_ACCESS_KEY, AWS_REGION = 'eu-west-1', AWS_SECRET_ACCESS_KEY } = require('config');

const sqs = new AWS.SQS({
	accessKeyId: AWS_ACCESS_KEY,
	region: AWS_REGION,
	secretAccessKey: AWS_SECRET_ACCESS_KEY
});

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

const publish = async event => {
	let transport = null;

	try {
		if (Object.prototype.toString.call(event) !== '[object MessageQueueEvent]') {
			throw new TypeError(`${MODULE_ID} expected event type \`[object MessageQueueEvent]\` and received \`${Object.prototype.toString.call(event)}\` instead.`);
		}

		transport = event.toSQSTransport();

		await sqs.sendMessageAsync(transport);

		log.info(`${MODULE_ID} SyndicationSQSQueuePublishSuccess =>`, { transport });

		return true;
	}
	catch (e) {
		log.error(`${MODULE_ID} SyndicationSQSQueuePublishError =>`, {
			error: e.stack,
			event,
			transport
		});

		return false;
	}
};

module.exports = exports = publish;
