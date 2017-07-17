'use strict';

const path = require('path');

const { default: log } = require('@financial-times/n-logger');

const {
	SYNDICATION_DOWNLOAD_SQS_URL: DEFAULT_QUEUE_URL
} = require('config');

const QueueSubscriber = require('../queue/subscriber');
const sleep = require('../server/helpers/sleep');

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

(async () => {
	let subscriber = new QueueSubscriber({ queue_url: DEFAULT_QUEUE_URL });

	subscriber.start(async (messages) => {
		log.info(`${MODULE_ID} => `, messages);
	});

	while (true) {
		await sleep();
	}
})();

process.on('uncaughtException', err => {
	log.error(`${MODULE_ID} UncaughtException =>`, {
		error: err.stack
	});
});

process.on('unhandledRejection', (reason, promise) => {
	log.warn(`${MODULE_ID} UnhandledRejection =>`, {
		error: reason.stack || reason,
		promise
	});
});

process.on('unhandledPromiseRejectionWarning', (reason, promise) => {
	log.warn(`${MODULE_ID} UnhandledPromiseRejectionWarning =>`, {
		error: reason.stack || reason,
		promise
	});
});
