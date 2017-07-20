'use strict';

module.exports = exports = (val, prop, item, saved) =>
	Object.prototype.toString.call(saved) === '[object Object]';
