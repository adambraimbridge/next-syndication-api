'use strict';

const path = require('path');

require('../queue/connect');

const log = require('./lib/logger');

const CONFIG = require('config');

const app = require('./app');

const PORT = process.env.PORT || CONFIG.PORT || 3255;

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

process.on('uncaughtException', err => {
	log.error(`${MODULE_ID} UncaughtException =>`, {
		error: err.stack
	});
});

app.listen(PORT, () => {
	log.info(`${MODULE_ID} Listening on => ${PORT}`);
});

module.exports = app;

process.on('unhandledRejection', (reason) => {
	log.error({
		event: 'UNHANDLED_PROMISE_REJECTION',
		reason
	});
});

process.on('unhandledPromiseRejectionWarning', (reason) => {
	log.warn({
		event: 'UNHANDLED_PROMISE_REJECTION_WARNING',
		error: reason
	});
});
