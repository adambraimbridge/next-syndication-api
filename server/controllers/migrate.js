'use strict';

const { stat } = require('fs');
const path = require('path');
const util = require('util');

const { default: log } = require('@financial-times/n-logger');

const {
	THE_GOOGLE: { AUTH_FILE_NAME },
} = require('config');

const statAsync = util.promisify(stat);

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
		} else {
			res.sendStatus(204);
		}

		next();
	} catch (error) {
		log.error(`${MODULE_ID}`, {
			error: error.stack,
		});

		res.sendStatus(500);
	}
};
