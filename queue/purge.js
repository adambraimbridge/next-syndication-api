'use strict';

const path = require('path');

const { default: log } = require('@financial-times/n-logger');

const {
	QUEUE_PURGE_THROTTLE_LIMIT_MS: THROTTLE_LIMIT_MS,
	SYNDICATION_DOWNLOAD_SQS_URL: DEFAULT_QUEUE_URL
} = require('config');

const sqs = require('./connect');

const THROTTLE_BY_QUEUE = {};

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

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

		log.debug(`${MODULE_ID} SyndicationSQSQueuePurgeSuccess =>`, { data, params });

		THROTTLE_BY_QUEUE[QueueUrl] = { now: Date.now() };

		return true;
	}
	catch (e) {
		log.error(`${MODULE_ID} SyndicationSQSQueuePurgeError =>`, {
			error: e.stack,
			params
		});

		return false;
	}
};

module.exports = exports = purgeQueue;
