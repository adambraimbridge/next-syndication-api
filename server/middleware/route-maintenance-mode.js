'use strict';

const { MAINTENANCE_MESSAGE } = require('config');

module.exports = exports = (req, res, next) => {
	const { locals: {
		MAINTENANCE_MODE
	} } = res;

	if (MAINTENANCE_MODE === true) {
		res.status(503);

		res.json({
			message: MAINTENANCE_MESSAGE
		});

		return;
	}

	next();
};
