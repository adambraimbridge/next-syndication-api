'use strict';

module.exports = exports = (val, prop, item, existing) =>
	Object.prototype.toString.call(existing) === '[object Object]' && existing.downloaded === true;
