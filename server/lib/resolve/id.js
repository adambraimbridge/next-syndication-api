'use strict';

const path = require('path');
const url = require('url');

module.exports = exports = item => {
	if (item.startsWith('http')) {
		return path.basename((url.parse(item)).pathname);
	}

	return item;
};
