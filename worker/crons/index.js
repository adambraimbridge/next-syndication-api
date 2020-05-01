'use strict';

const path = require('path');

const log = require('../../server/lib/logger');

exports.backup = require('./backup');
exports.redshift = require('./redshift');
exports.tidyBucket = require('./tidy-bucket');

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

process.on('unhandledRejection', (reason, promise) => {
	log.warn(`${MODULE_ID} | UnhandledRejection =>`, {
		error: reason.stack || reason,
		promise
	});
});
