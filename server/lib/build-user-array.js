'use strict';

const flagIsOn = require('../helpers/flag-is-on');

const buildUserArray = flags => {
	// UUIDs of existing test users of our new syndication system (this app
	// plus some bits in n-ui in the syndication folder)
	// using reduce to create a Map allows us to ensure only distinct values are stored
	let users = (process.env.NEW_SYNDICATION_USERS || '').split(',').reduce((acc, item) => {
		acc[item] = item;

		return acc;
	}, {});

	if (flagIsOn(flags.syndicationNewUsersAwaiting)) {
		// Add the next batch of folks to the list
		// using reduce to create a Map allows us to ensure only distinct values are stored
		users = (process.env.NEW_SYNDICATION_USERS_AWAITING || '').split(',').reduce((acc, item) => {
			acc[item] = item;

			return acc;
		}, users);
	}

	// finally return all distinct users filtering out any non-existent keys
	// that may have managed to infiltrate our barrier
	return Object.keys(users).filter(x => x);
};

module.exports = exports = buildUserArray;
