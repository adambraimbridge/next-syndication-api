'use strict';

const pg = require('../../db/pg');

module.exports = exports = async (req, res, next) => {
	if (res.locals.MAINTENANCE_MODE !== true) {
		res.locals.$DB = await pg();
	}

	next();
};
