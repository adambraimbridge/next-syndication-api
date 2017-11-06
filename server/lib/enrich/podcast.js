'use strict';

const mime = require('mime-types');

const article = require('./article');

const { DOWNLOAD_ARCHIVE_EXTENSION, DOWNLOAD_MEDIA_TYPES } = require('config');

module.exports = exports = function podcast(content, format) {
	content = article(content, format);

	content.hasTranscript = !!(content.bodyHTML__CLEAN && content.bodyHTML__CLEAN.length);
	content.transcriptExtension = content.extension;

	content.extension = DOWNLOAD_ARCHIVE_EXTENSION;

	if (content.canBeSyndicated === null || typeof content.canBeSyndicated === 'undefined') {
		content.canBeSyndicated = 'yes';
	}

	content.download = Array.from(content.attachments).reverse().find(item => item.mediaType === DOWNLOAD_MEDIA_TYPES.podcast);
	content.download.extension = mime.extension(content.download.mediaType);

	content.captions = content.attachments.filter(item => item.mediaType === DOWNLOAD_MEDIA_TYPES.caption);

	return content;
};
