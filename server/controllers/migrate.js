'use strict';

const { stat } = require('fs');
const util = require('util');

const log = require('../lib/logger');

const { THE_GOOGLE: { AUTH_FILE_NAME } } = require('config');

const statAsync = util.promisify(stat);

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

		let createAuthKey = false;

		try {
			await statAsync(AUTH_FILE_NAME);

			if (!stat.isFile()) {
				createAuthKey = true;
			}
		} catch (e) {
			createAuthKey = true;
		}

		if (createAuthKey === true) {
			const createKey = require('../../worker/create-key');

			await createKey();
		}

		const migrate = require('../../worker/crons/migration/callback');

		const migrated = await migrate(true);

		if (migrated) {
			res.status(200);

			res.json(migrated);
		}
		else {
			res.sendStatus(204);
		}

		next();
	}
	catch(error) {
		log.error({error});

		res.sendStatus(500);
	}
};
