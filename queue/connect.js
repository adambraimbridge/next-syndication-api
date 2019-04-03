'use strict';

const path = require('path');

require('./promisify');

const log = require('../server/lib/logger');

const AWS = require('aws-sdk');

const {
	AWS_ACCESS_KEY,
	AWS_SECRET_ACCESS_KEY,
	SYNDICATION_DOWNLOAD_SQS_URL: DEFAULT_QUEUE_URL
} = require('config');

const sqs = new AWS.SQS({
	accessKeyId: AWS_ACCESS_KEY,
	region: 'eu-west-1',
	secretAccessKey: AWS_SECRET_ACCESS_KEY
});

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

(async () => {
	const attributes = await sqs.getQueueAttributesAsync({
		AttributeNames: [
			'All'
		],
		QueueUrl: DEFAULT_QUEUE_URL
	});

	log.info(`${MODULE_ID} =>`, { response: JSON.stringify(attributes) });
})();

module.exports = exports = sqs;
