'use strict';

const hat = require('hat');

const rack = hat.rack();

module.exports = exports = event => {
	if (!event._id) {
		event._id = rack();
	}

	return event;
};
