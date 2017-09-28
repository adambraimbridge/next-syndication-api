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
	const { locals: { $DB: db, FT_User, userUuid } } = res;

	try {
		const [mu] = await db.run(`SELECT * FROM syndication.get_migrated_user($text$${userUuid}$text$);`);

		if (mu && mu.user_id !== null) {
			const [user] = await db.syndication.get_user([userUuid]);

			if (Date.now() - user.last_modified < SALESFORCE_REFRESH_CONTRACT_PERIOD) {
				res.locals.user = user;

				res.locals.isNewSyndicationUser = true;
				res.locals.EXPEDIATED_USER_AUTH = true;

				log.info(`${MODULE_ID} => true`);

				if (FT_User) {
					user.passport_id = FT_User.USERID || user.user_id;
				}
			}
		}
	}
	catch (err) {}

	next();
};