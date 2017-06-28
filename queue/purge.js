'use strict';

require('./promisify');

const log = require('@financial-times/n-logger').default;

const AWS = require('aws-sdk');

const {
	AWS_ACCESS_KEY,
	AWS_REGION = 'eu-west-1',
	AWS_SECRET_ACCESS_KEY,
	QUEUE_PURGE_THROTTLE_LIMIT_MS: THROTTLE_LIMIT_MS,
	SYNDICATION_DOWNLOAD_SQS_URL: DEFAULT_QUEUE_URL
} = require('config');

const sqs = new AWS.SQS({
	accessKeyId: AWS_ACCESS_KEY,
	region: AWS_REGION,
	secretAccessKey: AWS_SECRET_ACCESS_KEY
});

const THROTTLE_BY_QUEUE = {};

const purgeQueue = async (params = { QueueUrl: DEFAULT_QUEUE_URL }) => {
	let { QueueUrl } = params;

	if (THROTTLE_BY_QUEUE[QueueUrl]) {
		const ms = Date.now() - THROTTLE_BY_QUEUE[QueueUrl].now;

		if (THROTTLE_LIMIT_MS > ms) {
			if (!THROTTLE_BY_QUEUE[QueueUrl].timeoutId) {
				THROTTLE_BY_QUEUE[QueueUrl].timeoutId = setTimeout(async () => {
					clearTimeout(THROTTLE_BY_QUEUE[QueueUrl].timeoutId);
					delete THROTTLE_BY_QUEUE[QueueUrl].timeoutId;

					await purgeQueue(params);
				}, THROTTLE_LIMIT_MS - ms + 10);
			}

			return;
		}
	}

	try {
		let data = await sqs.purgeQueueAsync(params);

		log.info('SyndicationSQSQueuePurgeSuccess', JSON.stringify({ data, params }, null, 4));

		THROTTLE_BY_QUEUE[QueueUrl] = { now: Date.now() };

		return true;
	}
	catch (e) {
		log.error('SyndicationSQSQueuePurgeError', {
			err: e.stack,
			params
		});

		return false;
	}
};

module.exports = exports = purgeQueue;
