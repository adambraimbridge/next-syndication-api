'use strict';

const path = require('path');

const { default: log } = require('@financial-times/n-logger');

const createKey = require('../create-key');

exports.backup = require('./backup');
exports.legacy_downloads = require('./legacy_downloads');
exports.migration = require('./migration');
exports.redshift = require('./redshift');
exports.tidyBucket = require('./tidy-bucket');

createKey().then(() => {});

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

process.on('unhandledRejection', (reason, promise) => {
	log.warn(`${MODULE_ID} | UnhandledRejection =>`, {
		error: reason.stack || reason,
		promise
	});
});
