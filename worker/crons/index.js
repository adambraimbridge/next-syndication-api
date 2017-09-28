'use strict';

const path = require('path');

const { default: log } = require('@financial-times/n-logger');

const createKey = require('../create-key');

exports.backup = require('./backup');
//exports.content_cleanup = require('./content-cleanup');
exports.migration = require('./migration');
exports.redshift = require('./redshift');

createKey().then(() => {
	exports.backup.start();
//	exports.content_cleanup.start();
	exports.migration.start();
	exports.redshift.start();
});

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

process.on('unhandledRejection', (reason, promise) => {
	log.warn(`${MODULE_ID} | UnhandledRejection =>`, {
		error: reason.stack || reason,
		promise
	});
});
