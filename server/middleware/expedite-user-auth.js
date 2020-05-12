const log = require('../lib/logger');

const {
	SALESFORCE: {
		REFRESH_CONTRACT_PERIOD: SALESFORCE_REFRESH_CONTRACT_PERIOD
	}
} = require('config');


module.exports = exports = async (req, res, next) => {
	const { locals: {
		$DB: db,
		MAINTENANCE_MODE,
		userUuid
	} } = res;

	log.info('expedite-user-auth', { uuid: userUuid, maintenance: MAINTENANCE_MODE })

	if (MAINTENANCE_MODE !== true) {
		try {
			const [user] = await db.syndication.get_user([userUuid]);

			if (Date.now() - user.last_modified < SALESFORCE_REFRESH_CONTRACT_PERIOD) {
				res.locals.user = user;

				res.locals.isNewSyndicationUser = true;
				res.locals.EXPEDITED_USER_AUTH = true;
			}
		}
		catch (err) {
			log.error('expedite-user-error', { uuid: userUuid });
		}
	}

	next();
};
