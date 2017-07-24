'use strict';

const path = require('path');

const { default: log } = require('@financial-times/n-logger');

const moment = require('moment');

const getContentById = require('../lib/get-content-by-id');

const MessageQueueEvent = require('../../queue/message-queue-event');

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

module.exports = exports = async (req, res, next) => {
	try {
		const content = await getContentById(req.params.content_id, req.query.format);

		if (Object.prototype.toString.call(content) !== '[object Object]') {
			log.error(`${MODULE_ID} ContentNotFoundError => ${req.params.content_id}`);

			res.sendStatus(404);

			return;
		}

		res.locals.__event = new MessageQueueEvent({
			event: {
				content_id: content.id,
				contract_id: res.locals.syndication_contract.id,
				licence_id: res.locals.licence.id,
				state: 'save',
				syndication_state: String(content.canBeSyndicated),
				time: moment().toDate(),
				title: content.title,
				user_id: res.locals.userUuid
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
