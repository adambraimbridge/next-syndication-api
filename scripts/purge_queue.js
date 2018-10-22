'use strict';

const path = require('path');

const { default: log } = require('@financial-times/n-logger');

const { SYNDICATION_DOWNLOAD_SQS_URL: DEFAULT_QUEUE_URL } = require('config');

const sqs = require('../queue/connect');

const MODULE_ID =
	path.relative(process.cwd(), module.id) ||
	require(path.resolve('./package.json')).name;

(async () => {
	try {
		let res = await sqs.purgeQueueAsync({
			QueueUrl: DEFAULT_QUEUE_URL,
		});

		log.debug(`${MODULE_ID} SyndicationSQSQueuePurgeSuccess =>`, {
			QueueUrl: DEFAULT_QUEUE_URL,
			res,
		});
	} catch (e) {
		log.error(`${MODULE_ID} SyndicationSQSQueuePurgeError =>`, {
			QueueUrl: DEFAULT_QUEUE_URL,
			error: e.stack,
		});
	}
})();
