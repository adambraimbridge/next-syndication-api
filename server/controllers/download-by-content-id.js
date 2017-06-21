'use strict';

const path = require('path');

const { default: log } = require('@financial-times/n-logger');

const bundleContent = require('../lib/bundle-content');
const getContent = require('../lib/get-content');
const convertArticle = require('../lib/convert-article');
const prepareDownloadResponse = require('../lib/prepare-download-response');

const MessageQueueEvent = require('../../queue/message-queue-event');
const publish = require('../../queue/publish');

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

// article => b59dff10-3f7e-11e7-9d56-25f963e998b2
// live blog => 2e999754-c942-3eb8-9fcd-991a3fd5202c
// video (no transcript) => 80d634ea-fa2b-46b5-886f-1418c6445182
// video (transcript and captions) => d7bf1822-ec58-4a8e-a669-5cbcc0d6a1b2

const DOWNLOAD_AS_ARTICLE = {
	article: true,
	liveblog: true
};

module.exports = exports = (req, res, next) => {
	getContent(req.params.content_id, req.query.format)
		.then(content => {
			if (Object.prototype.toString.call(content) !== '[object Object]') {
				log.error(`${MODULE_ID} could not get item by content_id(${req.params.content_id}) => ${content}`);

				res.status(404).end();

				return;
			}

			if (DOWNLOAD_AS_ARTICLE[content.contentType]) {
				if (!content.bodyXML__CLEAN) {
					res.status(400).end();

					return;
				}

				prepareDownloadResponse(content, res);

				convertArticle({
					source: content[content.extension === 'plain' ? 'bodyXML__PLAIN' : 'bodyXML__CLEAN'],
					sourceFormat: 'html',
					targetFormat: content.extension
				}).then(file => {
					cleanup(content);

					log.debug(`${MODULE_ID} Success`, content);

					res.set('content-length', file.length);

					res.status(200).send(file);

					next();
				})
				.catch(e => {
					cleanup(content);

					log.error(`${MODULE_ID} Error`, content, e);

					res.status(400).end();
				});
			}
			else {
				if (!Array.isArray(content.dataSource) || !content.dataSource.length) {
					res.status(400).end();

					return;
				}

				prepareDownloadResponse(content, res);

				bundleContent(content, req, res, next);
			}
		});
};

const REMOVE_PROPERTIES = [
	'__doc',
	'download'
];

function cleanup(content) {
	REMOVE_PROPERTIES.forEach(property => delete content[property]);

	return content;
}