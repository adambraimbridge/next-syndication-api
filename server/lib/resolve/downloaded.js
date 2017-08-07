'use strict';

const { DOWNLOAD_STATE_MAP } = require('config');

module.exports = exports = (val, prop, item, existing) =>
	Object.prototype.toString.call(existing) === '[object Object]' && existing.item_state in DOWNLOAD_STATE_MAP;
