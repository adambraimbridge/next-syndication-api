'use strict';

const log = require('../lib/logger');

const inSafeList = requestersOrigin => {
	if (/^https:\/\/ft-next-syndication-(?:api|downloads).herokuapp\.com$/.test(requestersOrigin)) {
		return true;
	}

	// Only allow ft subdomains
	const subdomainRegex = /^(https?:\/\/)?((([^.]+)\.)*)ft\.com(:[0-9]{1,4})?$/;

	return subdomainRegex.test(requestersOrigin);
};

module.exports = exports = (req, res, next) => {
	const requestersOrigin = req.get('origin');
	const isCorsRequest = !!(requestersOrigin && inSafeList(requestersOrigin));

	log.info({
		requestersOrigin,
		isCorsRequest,
		method: req.method
	});

	if (isCorsRequest) {
		res.set('Access-Control-Allow-Origin', requestersOrigin);
		res.set('Access-Control-Allow-Headers', 'Content-Type, Cookie, *');
		res.set('Access-Control-Allow-Methods', 'GET');
		res.set('Access-Control-Allow-Credentials', true);
		res.set('Access-Control-Expose-Headers', 'FT-New-Syndication-User');
	}

	if (isCorsRequest && req.method === 'OPTIONS') {
		res.sendStatus(200);
	}
	else {
		next();
	}
};
