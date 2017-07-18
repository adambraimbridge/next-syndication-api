'use strict';

const path = require('path');

const { default: log } = require('@financial-times/n-logger');

const {
	SYNDICATION_DOWNLOAD_SQS_URL: DEFAULT_QUEUE_URL
} = require('config');

//require('../db/init');

const QueueSubscriber = require('../queue/subscriber');

const persist = require('./persist');

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

(async () => {
	let subscriber = new QueueSubscriber({ queue_url: DEFAULT_QUEUE_URL });

	subscriber.start(async (event, message) => {
		try {
			log.debug(`${MODULE_ID} RECEIVED => `, event);

			let res = await persist(event);

			log.debug(`${MODULE_ID} PERSISTED => `, res);

			await subscriber.ack(message);
		}
		catch (e) {
			log.error(`${MODULE_ID} => `, e);
		}
	});
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
