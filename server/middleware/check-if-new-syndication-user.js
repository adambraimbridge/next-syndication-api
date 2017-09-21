'use strict';

const path = require('path');

const { default: log } = require('@financial-times/n-logger');

const flagIsOn = require('../helpers/flag-is-on');

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

module.exports = exports = async (req, res, next) => {
	let isNewSyndicationUser = false;

	const { locals: { $DB: db, EXPEDIATED_USER_AUTH, contract, flags, user, userUuid } } = res;

	if (EXPEDIATED_USER_AUTH === true) {
		next();

		return;
	}

	const [mu] = await db.syndication.get_migrated_user([userUuid, contract.contract_id]);

	if ((mu && mu.user_id !== null) || (user.user_id && flagIsOn(flags.syndicationRedux))) {
		isNewSyndicationUser = true;

		res.set('FT-New-Syndication-User', 'true');

		log.info(`${MODULE_ID}`, { isNewSyndicationUser });

		res.locals.isNewSyndicationUser = isNewSyndicationUser;

		next();
	}
	else {
		res.sendStatus(401);
	}
};
