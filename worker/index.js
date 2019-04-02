'use strict';

const path = require('path');

const log = require('../server/lib/logger');

const {
	SYNDICATION_DOWNLOAD_SQS_URL: DEFAULT_QUEUE_URL
} = require('config');

const QueueSubscriber = require('../queue/subscriber');

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

module.exports = exports = ({ autoAck, callback, event_type, queue_url = DEFAULT_QUEUE_URL }) => {
	let subscriber = new QueueSubscriber({
		autoAck,
		queue_url,
		type: event_type
	});

	subscriber.start(callback);

	return subscriber;
};

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
