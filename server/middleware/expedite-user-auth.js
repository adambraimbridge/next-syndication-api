'use strict';

const path = require('path');

const log = require('../lib/logger');

const {
	SALESFORCE: {
		REFRESH_CONTRACT_PERIOD: SALESFORCE_REFRESH_CONTRACT_PERIOD
	}
} = require('config');

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

module.exports = exports = async (req, res, next) => {
	const { locals: {
		$DB: db,
		MAINTENANCE_MODE,
		userUuid
	} } = res;

	if (MAINTENANCE_MODE !== true) {
		try {
			const [user] = await db.syndication.get_user([userUuid]);

			if (Date.now() - user.last_modified < SALESFORCE_REFRESH_CONTRACT_PERIOD) {
				res.locals.user = user;

				res.locals.isNewSyndicationUser = true;
				res.locals.EXPEDITED_USER_AUTH = true;

				log.info(`${MODULE_ID} => true`);
			}
		}
		catch (err) {}
	}

	next();
};
