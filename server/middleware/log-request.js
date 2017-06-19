'use strict';

const log = require('@financial-times/n-logger').default;

const REQUEST_PROPERTIES = [
	'baseUrl', 'body', 'cookies',
	'headers', 'hostname', 'ip', 'ips',
	'method', 'originalUrl',
	'params', 'path', 'protocol',
	'query', 'route',
	'secure', 'subdomains', 'url'
];

module.exports = exports = function logRequest (req, res, next) {
	log.info(JSON.stringify(REQUEST_PROPERTIES.reduce((acc, prop) => {
		acc[prop] = req[prop];

		return acc;
	}, {
		'__TYPE__': 'HTTP_REQUEST'
	}), null, 4));

	next();
};
