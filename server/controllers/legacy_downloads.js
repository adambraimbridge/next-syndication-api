'use strict';

const { stat } = require('fs');
const util = require('util');

const log = require('../lib/logger');
const createKey = require('../../worker/create-key');
const { THE_GOOGLE: { AUTH_FILE_NAME } } = require('config');
const legacy_downloads = require('../../worker/crons/legacy_downloads/callback');
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


			await createKey();
		}


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
		log.error({error});

		res.sendStatus(500);
	}
};
