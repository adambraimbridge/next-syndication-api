'use strict';

const path = require('path');

const { default: log } = require('@financial-times/n-logger');
//const buildUserArray = require('../lib/build-user-array');

const flagIsOn = require('../helpers/flag-is-on');

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

module.exports = exports = (req, res, next) => {
	let isNewSyndicationUser = false;

	if (flagIsOn(res.locals.flags.syndicationRedux)) {
		isNewSyndicationUser = true;

		res.set('FT-New-Syndication-User', 'true');
	}

	log.debug(`${MODULE_ID}`, { isNewSyndicationUser });

	res.locals.isNewSyndicationUser = isNewSyndicationUser;

	next();
};
