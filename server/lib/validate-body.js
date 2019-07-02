'use strict';

const log = require('./logger');

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
	catch (err) {
		const error = new Error('Expected a JSON-parseable object containing an array property called `content`');
		error.statusCode = 400;

		log.info({
			event: 'VALIDATE_BODY_ERROR',
			actualError: err.stack,
			error: error,
		});

		return Promise.reject(error);
	}
};

module.exports = exports = validateBody;
