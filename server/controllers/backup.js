'use strict';

const path = require('path');

const { default: log } = require('@financial-times/n-logger');

const ACL = {
	user: false,
	superuser: false,
	superdooperuser: true,
	superdooperstormtrooperuser: true,
};

const MODULE_ID =
	path.relative(process.cwd(), module.id) ||
	require(path.resolve('./package.json')).name;

module.exports = exports = async (req, res, next) => {
	try {
		const {
			locals: { user },
		} = res;

		if (!user || ACL[user.role] !== true) {
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
	} catch (error) {
		log.error(`${MODULE_ID}`, {
			error: error.stack,
		});

		res.sendStatus(500);
	}
};
