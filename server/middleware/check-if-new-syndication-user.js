'use strict';
module.exports = exports = async (req, res, next) => {

	const { locals: {
		EXPEDITED_USER_AUTH,
		MAINTENANCE_MODE,
	} } = res;

	if (MAINTENANCE_MODE !== true && EXPEDITED_USER_AUTH !== true) {
		res.set('FT-New-Syndication-User', 'true');

		res.locals.isNewSyndicationUser = true;
	}

	next();

};
