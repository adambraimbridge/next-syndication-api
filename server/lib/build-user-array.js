const arrayify = (string = '') => {
	return string.split(',').filter(truthies => truthies);
};

module.exports = flags => {
	// UUIDs of existing test users of our new syndication system (this app
	// plus some bits in n-ui in the syndication folder)
	const newSyndicationUsersExisting = arrayify(process.env.NEW_SYNDICATION_USERS);

	if (flags.syndicationNewUsersAwaiting) {

		// Add the next batch of folks to the list
		const newSyndicationUsersAwaiting = arrayify(process.env.NEW_SYNDICATION_USERS_AWAITING);
		return [...newSyndicationUsersExisting, ...newSyndicationUsersAwaiting];

	} else {
		return newSyndicationUsersExisting;
	}
};
