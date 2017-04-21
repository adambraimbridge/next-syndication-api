const logger = require('@financial-times/n-logger').default;
const newSyndicators = require('../new-syndicators');

module.exports = (req, res, next) => {
	const isNewSyndicationUser = newSyndicators.includes(res.locals.userUuid);

	logger.info('in check-if-new-syndicator middleware', { isNewSyndicationUser });

	if (isNewSyndicationUser) {
		res.setHeader('FT-New-Syndication-User', 'true');
	}

	res.locals.isNewSyndicationUser = isNewSyndicationUser;

	next();
};
