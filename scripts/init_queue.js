'use strict';

const path = require('path');

const { default: log } = require('@financial-times/n-logger');

const {
	SYNDICATION_DOWNLOAD_SQS_URL: DEFAULT_QUEUE_URL
} = require('config');

const sqs = require('../queue/connect');

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

(async () => {
	try {
		let res = await sqs.createQueue({
			QueueName: DEFAULT_QUEUE_URL.split('/').pop(),
			Attributes: {}
		});

		log.info(`${MODULE_ID}`, { res });
	}
	catch (e) {
		log.error(`${MODULE_ID}`, { error: e.stack });
	}
})();
