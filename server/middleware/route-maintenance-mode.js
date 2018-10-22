'use strict';

module.exports = exports = (req, res, next) => {
	const {
		locals: { MAINTENANCE_MODE },
	} = res;

	if (MAINTENANCE_MODE === true) {
		res.status(503);

		res.json({
			message:
				'The Republishing Service is currently undergoing maintenance. Please try again later.',
		});

		return;
	}

	next();
};
