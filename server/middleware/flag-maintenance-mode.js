'use strict';

const flagIsOn = require('../helpers/flag-is-on');

module.exports = exports = (req, res, next) => {
	let { locals } = res;
	let { flags } = locals;

	locals.MAINTENANCE_MODE = !!(flags && flagIsOn(flags.syndicationMaintenance));

	next();
};
