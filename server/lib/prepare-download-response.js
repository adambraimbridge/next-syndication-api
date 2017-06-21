'use strict';

const mime = require('mime-types');

const { DOWNLOAD_ARTICLE_EXTENSION_OVERRIDES } = require('config');

module.exports = exports = (content, res) => {
	let extension = DOWNLOAD_ARTICLE_EXTENSION_OVERRIDES[content.extension] || content.extension;

//	let contentDisposition = `attachment; filename=${content.fileName}.${extension}`;

	res.attachment(`${content.fileName}.${extension}`);
//	res.set('content-type', mime.contentType(extension));
};