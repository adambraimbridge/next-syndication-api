'use strict';

const path = require('path');

const { default: log } = require('@financial-times/n-logger');
//const buildUserArray = require('../lib/build-user-array');

const flagIsOn = require('../helpers/flag-is-on');

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

module.exports = exports = async (req, res, next) => {
	let isNewSyndicationUser = false;

	const { locals: { $DB: db, contract, user, userUuid } } = res;

	const [mu] = await db.syndication.get_migrated_user([userUuid, contract.contract_id]);

	if ((mu && mu.user_id !== null) || (user.user_id && flagIsOn(res.locals.flags.syndicationRedux))) {
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
