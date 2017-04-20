const validateBody = body => {
	const validBody = body && body.content && typeof body.content.length === 'number';

	if (validBody) {
		return Promise.resolve(body);
	} else {
		return Promise.reject(new Error('Expected a JSON object containing an array property called `content`'));
	}
};

module.exports = validateBody;
