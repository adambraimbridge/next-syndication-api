'use strict';

const path = require('path');

const { default: log } = require('@financial-times/n-logger');

const sqs = require('./connect');

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

const publish = async event => {
	let transport = null;

	try {
		if (Object.prototype.toString.call(event) !== '[object MessageQueueEvent]') {
			throw new TypeError(`${MODULE_ID} expected event type \`[object MessageQueueEvent]\` and received \`${Object.prototype.toString.call(event)}\` instead.`);
		}

		transport = event.toSQSTransport();

		await sqs.sendMessageAsync(transport);

		log.info(`${MODULE_ID} SyndicationSQSQueuePublishSuccess =>`, { transport });

		return true;
	}
	catch (e) {
		log.error(`${MODULE_ID} SyndicationSQSQueuePublishError =>`, {
			error: e.stack,
			event,
			transport
		});

		return false;
	}
};

module.exports = exports = publish;
