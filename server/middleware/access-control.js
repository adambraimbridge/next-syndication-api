const logger = require('@financial-times/n-logger').default;
const inSafeList = requestersOrigin => {
	// Only allow ft subdomains
	const subdomainRegex = /^(https?:\/\/)?((([^.]+)\.)*)ft\.com(:[0-9]{1,4})?$/;

	return subdomainRegex.test(requestersOrigin);
}

module.exports = (req, res, next) => {
	const requestersOrigin = req.get('origin');
	const isCorsRequest = !!(requestersOrigin && inSafeList(requestersOrigin));

	logger.info('in access-control middleware', { requestersOrigin, isCorsRequest, method: req.method });

	if (isCorsRequest) {
		res.set('Access-Control-Allow-Origin', requestersOrigin);
		res.set('Access-Control-Allow-Credentials', true);
	}

	if (isCorsRequest && req.method === 'OPTIONS') {
		res.send(200);
	} else {
		next();
	}
};
