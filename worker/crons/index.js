'use strict';

const path = require('path');

const { default: log } = require('@financial-times/n-logger');

exports.content_cleanup = require('./content-cleanup');
exports.migration = require('./migration');

exports.content_cleanup.start();
exports.migration.start();

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

process.on('unhandledRejection', (reason, promise) => {
	log.warn(`${MODULE_ID} | UnhandledRejection =>`, {
		error: reason.stack || reason,
		promise
	});
});
