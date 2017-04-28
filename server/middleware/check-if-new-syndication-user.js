const logger = require('@financial-times/n-logger').default;
const buildUserArray = require('../lib/build-user-array');

module.exports = (req, res, next) => {
	const flags = res.locals.flags;
	const newSyndicationUsers = buildUserArray(flags);
	const isNewSyndicationUser = newSyndicationUsers.includes(res.locals.userUuid) || flags.syndicationNewOverride;

	logger.info('in check-if-new-syndication-user middleware', { isNewSyndicationUser });

	if (isNewSyndicationUser) {
		res.setHeader('FT-New-Syndication-User', 'true');
	}

	res.locals.isNewSyndicationUser = isNewSyndicationUser;

	next();
};
