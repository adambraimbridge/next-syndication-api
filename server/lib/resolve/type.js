'use strict';

const path = require('path');
const url = require('url');

const { CONTENT_TYPE_ALIAS } = require('config');

module.exports = exports = (val, prop, item, dbItem) => {
	if (!val) {
		val = item.type || item.content_type || dbItem.content_type;
	}

	if (val.startsWith('http')) {
		val = String(path.basename((url.parse(val)).pathname)).toLowerCase();
	}

	return CONTENT_TYPE_ALIAS[val] || val;
};
