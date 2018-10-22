'use strict';

const path = require('path');
const url = require('url');

module.exports = exports = (val, prop, item, dbItem) => {
	if (!val) {
		val = item.id || dbItem.content_id;
	}

	if (val.startsWith('http')) {
		return path.basename(url.parse(val).pathname);
	}

	return val;
};
