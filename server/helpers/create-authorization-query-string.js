const qs = require('querystring');
const { AUTH_API_CLIENT_ID } = require('config');

module.exports = exports = scope =>
	qs.stringify({
		client_id: AUTH_API_CLIENT_ID,
		redirect_uri: 'https://www.ft.com',
		response_type: 'token',
		scope
	});
