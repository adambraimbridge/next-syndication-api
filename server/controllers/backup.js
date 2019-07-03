'use strict';

const log = require('../lib/logger');

const ACL = {
	user: false,
	superuser: false,
	superdooperuser: true,
	superdooperstormtrooperuser: true
};

module.exports = exports = async (req, res, next) => {
	try {
		const { locals: { user } } = res;

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
	}
	catch(error) {
		log.error({
			event: 'BACKUP_ERROR',
			error
		});

		res.sendStatus(500);
	}
};
