'use strict';

const pg = require('../../db/pg');

module.exports = exports = async (req, res, next) => {
	res.locals.$DB = await pg();

	next();
};
