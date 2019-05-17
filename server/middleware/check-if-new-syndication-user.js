'use strict';

const path = require('path');

const log = require('../lib/logger');

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

module.exports = exports = async (req, res, next) => {

	const { locals: {
		EXPEDITED_USER_AUTH,
		MAINTENANCE_MODE,
	} } = res;

	if (MAINTENANCE_MODE !== true && EXPEDITED_USER_AUTH !== true) {
		res.set('FT-New-Syndication-User', 'true');

		log.info(`${MODULE_ID}`, { isNewSyndicationUser: true });

		res.locals.isNewSyndicationUser = true;
	}

	next();

};
