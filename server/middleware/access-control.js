const logger = require('@financial-times/n-logger').default;
const inSafeList = requestersOrigin => {
	// Only allow ft subdomains
	const subdomainRegex = /^(https?:\/\/)?((([^.]+)\.)*)ft\.com(:[0-9]{1,4})?$/;

	return subdomainRegex.test(requestersOrigin);
};

module.exports = (req, res, next) => {
	const requestersOrigin = req.get('origin');
	const isCorsRequest = !!(requestersOrigin && inSafeList(requestersOrigin));

	logger.info('in access-control middleware', { requestersOrigin, isCorsRequest, method: req.method });

	if (isCorsRequest) {
		res.set('Access-Control-Allow-Origin', requestersOrigin);
		res.set('Access-Control-Allow-Headers', 'Content-Type');
		res.set('Access-Control-Allow-Credentials', true);
		res.set('Access-Control-Expose-Headers', 'FT-New-Syndication-User');
	}

	if (isCorsRequest && req.method === 'OPTIONS') {
		res.sendStatus(200);
	} else {
		next();
	}
};
