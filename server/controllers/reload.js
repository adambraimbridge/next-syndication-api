'use strict';

const path = require('path');

const { default: log } = require('@financial-times/n-logger');

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

module.exports = exports = async (req, res, next) => {
	const { locals: { $DB: db, userUuid } } = res;

	try {
		if (userUuid !== '8ef593a8-eef6-448c-8560-9ca8cdca80a5') {

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
