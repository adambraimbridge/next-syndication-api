'use strict';

const path = require('path');

const log = require('../lib/logger');

const ACL = {
	user: false,
	superuser: false,
	superdooperuser: true,
	superdooperstormtrooperuser: true
};

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

module.exports = exports = async (req, res, next) => {
	const { locals: { $DB: db, user } } = res;

	try {
		if (!user || ACL[user.role] !== true) {
			res.sendStatus(403);

			return;
		}

		await db.run('SELECT syndication.reload_all()');

		res.sendStatus(204);

		next();
	}
	catch(error) {
		log.error(`${MODULE_ID}`, {
			error: error.stack
		});

		res.sendStatus(500);
	}
};
