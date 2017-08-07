'use strict';

const path = require('path');
const url = require('url');

const { CONTENT_TYPE_ALIAS } = require('config');

module.exports = exports = val => {
	const type = String(path.basename((url.parse(val)).pathname)).toLowerCase();

	return CONTENT_TYPE_ALIAS[type] || type;
};
