'use strict';

require('./promisify');

const log = require('@financial-times/n-logger').default;

const AWS = require('aws-sdk');

const formatMessage = require('./formatMessage');

const sqs = new AWS.SQS({
	accessKeyId: process.env.AWS_ACCESS_KEY,
	region: process.env.AWS_REGION || 'eu-west-1',
	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const DEFAULT_QUEUE_URL = process.env.SYNDICATION_DOWNLOAD_SQS_URL;

const publish = async ({ event, queue_url = DEFAULT_QUEUE_URL, format = formatMessage }) => {
	event = format(event);

	try {
		await sqs.sendMessageAsync({
			MessageBody: JSON.stringify(event),
			QueueUrl: queue_url
		});

		log.info('SyndicationSQSQueuePublishSuccess', {
			event,
			queue_url
		});

		return true;
	}
	catch (e) {
		log.error('SyndicationSQSQueuePublishError', {
			err: e.stack,
			event,
			queue_url
		});

		return false;
	}
};

module.exports = exports = publish;
