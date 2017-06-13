'use strict';

const path = require('path');

require('./promisify');

const log = require('@financial-times/n-logger').default;

const AWS = require('aws-sdk');

const sqs = new AWS.SQS({
	accessKeyId: process.env.AWS_ACCESS_KEY,
	region: process.env.AWS_REGION || 'eu-west-1',
	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

const publish = async event => {
	try {
		if (Object.prototype.toString.call(event) !== '[object MessageQueueEvent]') {
			throw new TypeError(`${MODULE_ID} expected event type \`[object MessageQueueEvent]\` and received \`${Object.prototype.toString.call(event)}\` instead.`);
		}

		await sqs.sendMessageAsync(event.toSQSTransport());

		log.info('SyndicationSQSQueuePublishSuccess', {
			event
		});

		return true;
	}
	catch (e) {
		log.error('SyndicationSQSQueuePublishError', {
			err: e.stack,
			event
		});

		return false;
	}
};

module.exports = exports = publish;