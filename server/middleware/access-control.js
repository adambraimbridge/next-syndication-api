const inSafeList = requestersOrigin => {
	// Only allow ft subdomains
	const subdomainRegex = /^(https?:\/\/)?((([^.]+)\.)*)ft\.com(:[0-9]{1,4})?$/;

	return subdomainRegex.test(requestersOrigin);
}

module.exports = (req, res, next) => {
	const requestersOrigin = req.get('origin');
	const isCorsRequest = requestersOrigin && inSafeList(requestersOrigin);

	if (isCorsRequest) {
		res.set('Access-Control-Allow-Origin', requestersOrigin);
		res.set('Access-Control-Allow-Credentials', true);
	}

	next();
};
