'use strict';

module.exports = exports = flag =>
	!!(flag && (String(flag).toLowerCase() === 'on' || flag === true));
