'use strict';

const path = require('path');

const { default: log } = require('@financial-times/n-logger');
//const buildUserArray = require('../lib/build-user-array');

const flagIsOn = require('../helpers/flag-is-on');

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

module.exports = exports = (req, res, next) => {
	if (flagIsOn(res.locals.flags.syndicationRedux)) {
		const isNewSyndicationUser = true;

		log.debug(`${MODULE_ID}`, { isNewSyndicationUser });

		if (isNewSyndicationUser) {
			res.set('FT-New-Syndication-User', 'true');
		}

		res.locals.isNewSyndicationUser = isNewSyndicationUser;
	}

	next();
};
