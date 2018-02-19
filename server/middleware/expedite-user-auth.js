'use strict';

const path = require('path');

const { default: log } = require('@financial-times/n-logger');

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
		flags,
		userUuid
	} } = res;

	if (MAINTENANCE_MODE !== true) {
		try {
			let expedite = false;

			if (flags.syndicationMigrationComplete) {
				expedite = true;
			}
			else {
				const [mu] = await db.run(`SELECT * FROM syndication.get_migrated_user($text$${userUuid}$text$);`);

				if (mu && mu.user_id !== null) {
					expedite = true;
				}
			}

			if (expedite === true) {
				const [user] = await db.syndication.get_user([userUuid]);

				if (Date.now() - user.last_modified < SALESFORCE_REFRESH_CONTRACT_PERIOD) {
					res.locals.user = user;

					res.locals.isNewSyndicationUser = true;
					res.locals.EXPEDITED_USER_AUTH = true;

					log.info(`${MODULE_ID} => true`);
				}
			}
		}
		catch (err) {}
	}

	next();
};
