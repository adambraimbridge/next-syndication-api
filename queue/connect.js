'use strict';

const path = require('path');

require('./promisify');

const { default: log } = require('@financial-times/n-logger');

const AWS = require('aws-sdk');

const {
	AWS_ACCESS_KEY,
	AWS_REGION = 'eu-west-1',
	AWS_SECRET_ACCESS_KEY,
	SYNDICATION_DOWNLOAD_SQS_URL: DEFAULT_QUEUE_URL
} = require('config');

const sqs = new AWS.SQS({
	accessKeyId: AWS_ACCESS_KEY,
	region: AWS_REGION,
	secretAccessKey: AWS_SECRET_ACCESS_KEY
});

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

(async () => {
	const attributes = await sqs.getQueueAttributesAsync({
		QueueUrl: DEFAULT_QUEUE_URL
	});

	log.debug(`${MODULE_ID} =>`, attributes);
})();

module.exports = exports = sqs;
