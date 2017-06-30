'use strict';

const path = require('path');

const { default: log } = require('@financial-times/n-logger');

const moment = require('moment');

const bundleContent = require('../lib/bundle-content');
const getContentById = require('../lib/get-content-by-id');
const convertArticle = require('../lib/convert-article');
const prepareDownloadResponse = require('../lib/prepare-download-response');

const MessageQueueEvent = require('../../queue/message-queue-event');

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

const DOWNLOAD_AS_ARTICLE = {
	article: true,
	liveblog: true
};

module.exports = exports = (req, res, next) => {
	const START = Date.now();

	getContentById(req.params.content_id, req.query.format)
		.then(content => {
			if (Object.prototype.toString.call(content) !== '[object Object]') {
				log.error(`${MODULE_ID} could not get item by content_id(${req.params.content_id}) => ${content}`);

				res.status(404).end();

				return;
			}

			res.__content = content;
			res.__event = new MessageQueueEvent({
				event: {
					content_id: content.id,
					download_format: content.extension,
					licence_id: res.locals.licence.id,
					state: 'start',
					syndication_state: String(content.canBeSyndicated),
					time: moment().toDate(),
					user_id: res.locals.userUuid
				}
			});

			process.nextTick(async () => await res.__event.publish());

			if (DOWNLOAD_AS_ARTICLE[content.contentType]) {
				if (!content.bodyXML__CLEAN) {
					res.status(400).end();

					return;
				}

				prepareDownloadResponse(res);

				convertArticle({
					source: content[content.extension === 'plain' ? 'bodyXML__PLAIN' : 'bodyXML__CLEAN'],
					sourceFormat: 'html',
					targetFormat: content.extension
				}).then(file => {
					cleanup(content);

					log.debug(`${MODULE_ID} Success`, content);

					res.set('content-length', file.length);

					publishEndEvent(res, 'complete');

					res.status(200).send(file);

					log.debug(`${MODULE_ID} #${content.id} => ${Date.now() - START}ms`);

					next();
				})
				.catch(e => {
					cleanup(content);

					log.error(`${MODULE_ID} Error`, content, e);

					publishEndEvent(res, 'error');

					res.status(400).end();
				});
			}
			else {
				if (!Array.isArray(content.dataSource) || !content.dataSource.length) {
					res.status(400).end();

					return;
				}

				prepareDownloadResponse(res);

				bundleContent(req, res, next);
			}
		})
		.catch(error => {
			log.error(`${MODULE_ID} Error retrieving content_id(${req.params.content_id})`, { error });

			res.sendStatus(500);
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

function publishEndEvent(res, state) {
	const event = res.__event.clone({
		state,
		time: moment().toJSON()
	});

	process.nextTick(async () => await event.publish());
}
