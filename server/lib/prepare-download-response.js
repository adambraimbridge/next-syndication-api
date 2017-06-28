'use strict';

const { DOWNLOAD_ARTICLE_EXTENSION_OVERRIDES } = require('config');

module.exports = exports = (res) => {
	let { __content: content } = res;

	let extension = DOWNLOAD_ARTICLE_EXTENSION_OVERRIDES[content.extension] || content.extension;

	res.attachment(`${content.fileName}.${extension}`);
};
