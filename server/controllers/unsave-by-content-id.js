'use strict';

const path = require('path');

const { default: log } = require('@financial-times/n-logger');

const moment = require('moment');

const MessageQueueEvent = require('../../queue/message-queue-event');

const getContentById = require('../lib/get-content-by-id');

const {
	DEFAULT_DOWNLOAD_FORMAT,
	DEFAULT_DOWNLOAD_LANGUAGE
} = require('config');

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

module.exports = exports = async (req, res, next) => {
	try {
		const referrer = String(req.get('referrer'));

		const lang = String(req.query.lang || (referrer.includes('/republishing/spanish') ? 'es' : DEFAULT_DOWNLOAD_LANGUAGE)).toLowerCase();

		const content = await getContentById(req.params.content_id, DEFAULT_DOWNLOAD_FORMAT, lang);

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
				iso_lang_code: lang,
				licence_id: res.locals.licence.id,
				published_date: content.firstPublishedDate || content.publishedDate,
				state: 'deleted',
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
					email: res.locals.user.email,
					first_name: res.locals.user.first_name,
					id: res.locals.user.user_id,
					surname: res.locals.user.surname
				}
			}
		});

		await res.locals.__event.publish();

		log.debug(`${MODULE_ID} ContentFoundSuccess => ${content.id}`);

		const { locals: { $DB: db, syndication_contract } } = res;

		const items = await db.syndication.delete_save_history_by_contract_id([syndication_contract.id, content.id]);

		log.info(`${MODULE_ID} => ${items.length} items deleted for contract#${syndication_contract.id}; content#${content.id};`, items);

		const requestedWith = String(req.get('x-requested-with')).toLowerCase();

		if (referrer.includes('/republishing/save') && (requestedWith !== 'xmlhttprequest' && !requestedWith.includes('fetch'))) {
			res.redirect(referrer);

			return;
		}
		else {
			res.sendStatus(204);
		}

		next();
	}
	catch (error) {
		log.error(`${MODULE_ID} ContentNotFoundError => ${req.params.content_id})`, {
			error: error.stack
		});

		res.sendStatus(500);
	}
};
