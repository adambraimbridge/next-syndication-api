const logger = require('@financial-times/n-logger').default;
const validateBody = body => {
	try {

		const validBody = body.content && typeof body.content.length === 'number';

		if (validBody) {
			return Promise.resolve(body);
		} else {
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
