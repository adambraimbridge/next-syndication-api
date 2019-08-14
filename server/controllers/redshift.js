'use strict';

const log = require('../lib/logger');

const backup = require('../../worker/crons/redshift/callback');

const ACL = {
	user: false,
	superuser: false,
	superdooperuser: true
};

module.exports = exports = async (req, res, next) => {
	try {
		const { locals: { user } } = res;

		if (!user || ACL[user.role] !== true) {
			res.sendStatus(401);

			return;
		}

		await backup(true);

		res.sendStatus(204);

		next();
	}
	catch(error) {

		log.error({
			event: 'REDSHIFT_ENDPOINT_ERROR',
			error
		});

		res.sendStatus(500);
	}
};
