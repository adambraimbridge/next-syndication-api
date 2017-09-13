'use strict';

const path = require('path');

const { default: log } = require('@financial-times/n-logger');

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

module.exports = exports = async (req, res, next) => {
	try {
		if (res.locals.userUuid !== '8ef593a8-eef6-448c-8560-9ca8cdca80a5') {

			res.sendStatus(401);

			return;
		}

		const backup = require('../../worker/crons/backup/callback');

		const { archive, file_name } = await backup(true);

		archive.pipe(res);

		res.attachment(file_name);

		archive.on('end', () => {
			res.status(200);

			res.end();

			next();
		});

		archive.on('error', () => {
			res.status(500);

			res.end();
		});
	}
	catch(error) {
		log.error(`${MODULE_ID}`, {
			error: error.stack
		});

		res.sendStatus(500);
	}
};
