'use strict';

const log = require('../lib/logger');

const moment = require('moment');

const MessageQueueEvent = require('../../queue/message-queue-event');

const getContentById = require('../lib/get-content-by-id');

const {
	DEFAULT_DOWNLOAD_FORMAT,
	DEFAULT_DOWNLOAD_LANGUAGE
} = require('config');

module.exports = exports = async (req, res, next) => {
	try {
		const {
			licence,
			syndication_contract,
			user
		} = res.locals;

		const { download_format } = user;

		const format = req.query.format
					|| download_format
					|| DEFAULT_DOWNLOAD_FORMAT;

		const referrer = String(req.get('referrer'));

		const lang = String(req.query.lang || (referrer.includes('/republishing/spanish') ? 'es' : DEFAULT_DOWNLOAD_LANGUAGE)).toLowerCase();

		const content = await getContentById(req.params.content_id, format, lang);

		if (Object.prototype.toString.call(content) !== '[object Object]') {

			res.sendStatus(404);

			return;
		}

		res.locals.__event = new MessageQueueEvent({
			event: {
				content_id: content.id,
				content_type: content.content_type,
				content_url: content.webUrl,
				contract_id: syndication_contract.id,
				iso_lang_code: lang,
				licence_id: licence.id,
				published_date: content.firstPublishedDate || content.publishedDate,
				state: 'saved',
				syndication_state: String(content.canBeSyndicated),
				time: moment().toDate(),
				title: content.title,
				tracking: {
					cookie: req.headers.cookie,
					ip_address: req.ip,
					referrer: referrer,
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

		await res.locals.__event.publish();

		res.sendStatus(204);

		next();
	}
	catch(error) {
		log.error({
			event: 'CONTENT_NOT_FOUND_ERROR',
			contentId: req.params.content_id,
			error
		});

		res.sendStatus(500);
	}
};
