'use strict';

const article = require('./article');

module.exports = exports = function package_(content, format) {
	content = article(content, format);

	return content;
};
