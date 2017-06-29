'use strict';

const cache = (req, res, next) => {
	// Don’t cache for now
	res.set('Surrogate-Control', res.FT_NO_CACHE);
	res.set('Cache-Control', res.FT_NO_CACHE);

	next();
};

module.exports = cache;
