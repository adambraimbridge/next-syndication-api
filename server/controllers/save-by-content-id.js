'use strict';

const path = require('path');

const { default: log } = require('@financial-times/n-logger');

const moment = require('moment');

const MessageQueueEvent = require('../../queue/message-queue-event');

const fetchContentById = require('../lib/fetch-content-by-id');

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

module.exports = exports = async (req, res, next) => {
	try {
		const content = await fetchContentById(req.params.content_id);

		if (Object.prototype.toString.call(content) !== '[object Object]') {
			log.error(`${MODULE_ID} ContentNotFoundError => ${req.params.content_id}`);

			res.sendStatus(404);

			return;
		}

		res.locals.__event = new MessageQueueEvent({
			event: {
				content_id: content.id,
				content_type: content.contentType,
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
					first_name: res.locals.user.firstName,
					id: res.locals.user.user_id,
					passport_id: res.locals.FT_User.USERID,
					surname: res.locals.user.lastName
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
