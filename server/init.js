'use strict';

const path = require('path');

require('../db/init');

const { default: log } = require('@financial-times/n-logger');

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
