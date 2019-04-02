'use strict';

const { stat } = require('fs');
const path = require('path');
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

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

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

		const legacy_downloads = require('../../worker/crons/legacy_downloads/callback');

		const val = await legacy_downloads(true);

		if (val) {
			res.status(200);

			res.json(val);
		}
		else {
			res.sendStatus(204);
		}

		next();
	}
	catch(error) {
		log.error(`${MODULE_ID}`, {
			error: error.stack
		});

		res.sendStatus(500);
	}
};
