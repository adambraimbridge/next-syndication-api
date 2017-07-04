'use strict';

const path = require('path');

const { default: log } = require('@financial-times/n-logger');
const buildUserArray = require('../lib/build-user-array');

const flagIsOn = require('../helpers/flag-is-on');

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

module.exports = exports = (req, res, next) => {
	const flags = res.locals.flags;
	const newSyndicationUsers = buildUserArray(flags);
	const isNewSyndicationUser = newSyndicationUsers.includes(res.locals.userUuid)
							|| flagIsOn(flags.syndicationNewOverride);

	log.debug(`${MODULE_ID}`, { isNewSyndicationUser });

	if (isNewSyndicationUser) {
		res.set('FT-New-Syndication-User', 'true');
	}

	res.locals.isNewSyndicationUser = isNewSyndicationUser;

	next();
};
