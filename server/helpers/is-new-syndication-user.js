'use strict';

const flagIsOn = require('../helpers/flag-is-on');

module.exports = exports = flags =>
	!!(flags && flagIsOn(flags.syndicationNew));
