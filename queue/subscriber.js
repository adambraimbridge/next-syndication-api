'use strict';

const path = require('path');

const { default: log } = require('@financial-times/n-logger');

const {
	SYNDICATION_DOWNLOAD_SQS_URL: DEFAULT_QUEUE_URL
} = require('config');

const sqs = require('./connect');

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

module.exports = exports = class QueueSubscriber {
	constructor({ callback, queue_url = DEFAULT_QUEUE_URL }) {
		this.queue_url = queue_url;

		this.callbacks = new Set();

		!callback || this.addCallback(callback);
	}

	addCallback(callback) {
		this.validateCallback(callback);

		this.callbacks.add(callback);
	}

	async fire(messages) {
		for (let [callback] of this.callbacks.values()) {

			let type = Object.prototype.toString.call(callback);

			switch (type) {
				case '[object Function]':
					callback(messages);
					break;
				case '[object AsyncFunction]':
					await callback(messages);
					break;
			}
		}
	}

	removeCallback(callback) {
		if (this.callbacks.has(callback)) {
			this.callbacks.delete(callback);
		}
	}

	start(callback) {
		if (typeof callback === 'function') {
			this.addCallback(callback);
		}

		this.running = true;

		this.onStart();
	}

	onStart() {
		if (this.running !== true) {
			return;
		}

		try {
			process.nextTick(async () => {
				let messages = await sqs.receiveMessageAsync({
					QueueUrl: DEFAULT_QUEUE_URL,
					AttributeNames: [
						'All'
					],
					MaxNumberOfMessages: 10,
					VisibilityTimeout: 0,
					WaitTimeSeconds: 20
				});

				log.info(`${MODULE_ID} SyndicationSQSQueueSubscribeSuccess =>`, { messages });

				await this.fire(messages);

				process.nextTick(() => this.onStart());
			});

			return true;
		}
		catch (e) {
			log.error(`${MODULE_ID} SyndicationSQSQueueSubscribeError =>`, {
				error: e.stack
			});

			return false;
		}
	}

	stop() {
		if (this.running === true) {
			this.running = false;
		}
	}

	validateCallback(callback) {
		const cbType = Object.prototype.toString.call(callback);

		if (!cbType.endsWith('Function]')) {
			throw new TypeError(`${MODULE_ID} expects callback to be a function and received \`${cbType}\` instead.`);
		}

		return callback;
	}

};
