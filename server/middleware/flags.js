'use strict';

const flagIsOn = require('../helpers/flag-is-on');

module.exports = exports = (req, res, next) => {
	let { locals: { flags } } = res;

	if (flags && flagIsOn(flags.syndicationNew)) {
		next();
	}
	else {
		res.sendStatus(404);
	}
};
