'use strict';

const path = require('path');

const MessageQueueEvent = require('../../../queue/message-queue-event');
const moment = require('moment');

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

module.exports = exports = (config) => {
	const { content, contract, lang, licence, req, user } = config;

	if (content.content_type in exports) {
		config.event = new MessageQueueEvent({
			event: {
				content_id: content.id,
				content_type: content.content_type,
				content_url: content.webUrl,
				contract_id: contract.contract_id,
				download_format: content.extension,
				iso_lang_code: lang,
				licence_id: licence.id,
				published_date: content.firstPublishedDate || content.publishedDate,
				state: 'started',
				syndication_state: String(content.canBeSyndicated),
				time: moment().toDate(),
				title: content.title,
				tracking: {
					cookie: req.headers.cookie,
					ip_address: req.ip,
					referrer: req.get('referrer'),
					session: req.cookies.FTSession,
					spoor_id: req.cookies['spoor-id'],
					url: req.originalUrl,
					user_agent: req.get('user-agent')
				},
				user: {
					email: user.email,
					first_name: user.first_name,
					id: user.user_id,
					surname: user.surname
				}
			}
		});

		return new exports[content.content_type](config);
	}

	throw new TypeError(`${MODULE_ID} ${content.content_type} cannot be downloaded for content_id#${content.content_id}`);
};

exports.article = require('./article');
exports.podcast = require('./podcast');
exports.video = require('./video');
