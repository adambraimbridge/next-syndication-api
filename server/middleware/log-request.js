'use strict';

const { default: log } = require('@financial-times/n-logger');

const IS_PROD = process.env.NODE_ENV === 'production';

const REQUEST_PROPERTIES = [
	'baseUrl', 'body', 'cookies',
	'headers', 'hostname', 'ip', 'ips',
	'method', 'originalUrl',
	'params', 'path', 'protocol',
	'query',
	'secure', 'subdomains', 'url'
];

module.exports = exports = (req, res, next) => {
	let msg = REQUEST_PROPERTIES.reduce((acc, prop) => {
		acc[prop] = IS_PROD && Object.prototype.toString.call(req[prop]) === '[object Object]'
				? JSON.stringify(req[prop])
				: req[prop];

		return acc;
	}, {
		'__TYPE__': 'HTTP_REQUEST',
		'__FLAGS__': IS_PROD ? JSON.stringify(res.locals.flags) : res.locals.flags
	});

	log.debug(IS_PROD ? msg : JSON.stringify(msg, null, 4));

	next();
};
