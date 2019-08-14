'use strict';
const log = require('../lib/logger');
const pg = require('../../db/pg');

module.exports = exports = async (req, res, next) => {
	try {
		if (res.locals.MAINTENANCE_MODE !== true) {
			res.locals.$DB = await pg();
		}
		next();
	} catch(error) {
		log.error({
			event: 'DB_MIDDLEWARE_ERROR',
			error
		});
		next(error);
	}
};
