const logger = require('@financial-times/n-logger').default;
const validateBody = body => {
	try {
		// Attempt to JSON parse any data received as `text/plain`
		// (POSTing as `text/plain` avoids triggering a CORS preflight request)
		const parsedBody = (typeof body === 'object') ? body : JSON.parse(body);
		const validBody = parsedBody.content && typeof parsedBody.content.length === 'number';

		if (validBody) {
			return Promise.resolve(parsedBody);
		}
		else {
			throw new Error();
		}
	}
	catch (e) {
		const err = new Error('Expected a JSON-parseable object containing an array property called `content`');
		err.statusCode = 400;
		logger.info('in validate-body lib', { err: err.message, body });

		return Promise.reject(err);
	}
};

module.exports = validateBody;
