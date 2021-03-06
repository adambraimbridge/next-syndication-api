'use strict';

const log = require('../lib/logger');

const ACL = {
	user: false,
	superuser: false,
	superdooperuser: true
};

module.exports = exports = async (req, res, next) => {
	const { locals: { $DB: db, user } } = res;

	try {
		if (!user || ACL[user.role] !== true) {
			res.sendStatus(403);

			return;
		}

		await db.query('SELECT syndication.reload_all()');

		res.sendStatus(204);

		next();
	}
	catch(error) {
		log.error({
			event: 'RELOAD_ERROR',
			error
		});

		res.sendStatus(500);
	}
};
