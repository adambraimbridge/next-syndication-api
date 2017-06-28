'use strict';

const buildUserArray = flags => {
	// UUIDs of existing test users of our new syndication system (this app
	// plus some bits in n-ui in the syndication folder)
	const newSyndicationUsersExisting = (process.env.NEW_SYNDICATION_USERS || '').split(',').filter(item => item);

	if (flags.syndicationNewUsersAwaiting) {

		// Add the next batch of folks to the list
		const newSyndicationUsersAwaiting = (process.env.NEW_SYNDICATION_USERS_AWAITING || '').split(',').filter(item => item);
		return [...newSyndicationUsersExisting, ...newSyndicationUsersAwaiting];

	}
	else {
		return newSyndicationUsersExisting;
	}
};

module.exports = exports = buildUserArray;
