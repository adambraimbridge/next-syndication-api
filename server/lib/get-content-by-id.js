'use strict';

const path = require('path');

const mime = require('mime-types');

const { default: log } = require('@financial-times/n-logger');

const fetchContentById = require('./fetch-content-by-id');
const formatArticleXML = require('./format-article-xml');
const getWordCount = require('./get-word-count');
const decorateArticle = require('./decorate-article');
const toPlainText = require('./to-plain-text');

const {
	DOWNLOAD_ARCHIVE_EXTENSION,
	DOWNLOAD_ARTICLE_FORMATS,
	DOWNLOAD_FILENAME_PREFIX
} = require('config');

const RE_BAD_CHARS = /[^A-Za-z0-9_]/gm;
const RE_SPACE = /\s/gm;

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

module.exports = exports = async (content_id, format) => {
	const START = Date.now();

	const content = await fetchContentById(content_id);

	if (Object.prototype.toString.call(content) !== '[object Object]') {
		return content;
	}

	content.contentType = content.type.split('/').pop().toLowerCase();

	if (content.contentType === 'mediaresource') {
		if (content.transcript) {
			if (!content.transcript.startsWith('<body>')) {
				content.transcript = `<body>${content.transcript}</body>`;
			}

			content.__doc = formatArticleXML(content.transcript);

			content.__doc = decorateArticle(content.__doc, content);

			content.transcript__CLEAN = content.__doc.toString();

			content.transcript__PLAIN = toPlainText(content.transcript__CLEAN);

			content.transcriptExtension = DOWNLOAD_ARTICLE_FORMATS[format] || 'docx';
		}

		content.download = content.dataSource[content.dataSource.length - 1];
		content.download.extension = mime.extension(content.download.mediaType);
		content.extension = DOWNLOAD_ARCHIVE_EXTENSION;
	}
	else if (content.bodyXML) {
		content.extension = DOWNLOAD_ARTICLE_FORMATS[format] || 'docx';

		content.__doc = formatArticleXML(content.bodyXML);

		content.__wordCount = getWordCount(content.__doc);

		content.__doc = decorateArticle(content.__doc, content);

		content.bodyXML__CLEAN = content.__doc.toString();

		if (content.extension === 'plain') {
			// we need to strip all formatting — leaving only paragraphs — and pass this to pandoc for plain text
			// otherwise it will uppercase the whole article title and anything bold, as well as leave other weird
			// formatting in the text file
			content.bodyXML__PLAIN = toPlainText(content.__doc.toString());
		}
	}

	content.fileName = DOWNLOAD_FILENAME_PREFIX + content.title.replace(RE_SPACE, '_').replace(RE_BAD_CHARS, '').substring(0, 12);

	log.debug(`${MODULE_ID} #${content.id} => ${Date.now() - START}ms`);

	return content;
};
