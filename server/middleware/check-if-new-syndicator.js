const newSyndicators = require('../new-syndicators');

module.exports = (req, res, next) => {
	const isNewSyndicationUser = newSyndicators.includes(res.locals.userUuid);

	if (isNewSyndicationUser) {
		res.setHeader('FT-New-Syndication-User', 'true');
	}

	res.locals.isNewSyndicationUser = isNewSyndicationUser;

	next();
};
