'use strict';

const path = require('path');

const { default: log } = require('@financial-times/n-logger');

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

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

		log.info(`${MODULE_ID}`, {
			actualError: e.stack,
			err: err,
			body
		});

		return Promise.reject(err);
	}
};

module.exports = exports = validateBody;
