'use strict';

const path = require('path');

const { default: log } = require('@financial-times/n-logger');

const moment = require('moment');

const MessageQueueEvent = require('../../queue/message-queue-event');

const getContentById = require('../lib/get-content-by-id');

const { DEFAULT_DOWNLOAD_FORMAT } = require('config');

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

module.exports = exports = async (req, res, next) => {
	try {
		const { download_format } = res.locals.user;

		const format = req.query.format
					|| download_format
					|| DEFAULT_DOWNLOAD_FORMAT;

		const content = await getContentById(req.params.content_id, format);

		if (Object.prototype.toString.call(content) !== '[object Object]') {
			log.error(`${MODULE_ID} ContentNotFoundError => ${req.params.content_id}`);

			res.sendStatus(404);

			return;
		}

		res.locals.__event = new MessageQueueEvent({
			event: {
				content_id: content.id,
				content_type: content.content_type,
				content_url: content.webUrl,
				contract_id: res.locals.syndication_contract.id,
				licence_id: res.locals.licence.id,
				published_date: content.firstPublishedDate || content.publishedDate,
				state: 'saved',
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
					email: res.locals.user.email,
					first_name: res.locals.user.first_name,
					id: res.locals.user.user_id,
					passport_id: res.locals.FT_User.USERID,
					surname: res.locals.user.surname
				}
			}
		});

		await res.locals.__event.publish();

		log.debug(`${MODULE_ID} ContentFoundSuccess => ${content.id}`);

		res.sendStatus(204);

		next();
	}
	catch(error) {
		log.error(`${MODULE_ID} ContentNotFoundError => ${req.params.content_id})`, {
			error: error.stack
		});

		res.sendStatus(500);
	}
};
