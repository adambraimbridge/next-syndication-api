'use strict';

const { EventEmitter } = require('events');
const path = require('path');

const { default: log } = require('@financial-times/n-logger');

const {
	SYNDICATION_DOWNLOAD_SQS_URL: DEFAULT_QUEUE_URL
} = require('config');

const sqs = require('./connect');

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

module.exports = exports = class QueueSubscriber extends EventEmitter {
	constructor({
		autoAck = false,
		callback,
		max_messages = 4,
		queue_url = DEFAULT_QUEUE_URL,
		type
	}) {
		super();

		this.autoAck = autoAck;
		this.type = type;

		this.max_messages = max_messages;
		this.queue_url = queue_url;

		this.callbacks = new Set();

		!callback || this.addCallback(callback);
	}

	ack(message) {
		return sqs.deleteMessageAsync({
			QueueUrl: this.queue_url,
			ReceiptHandle: message.ReceiptHandle
		});
	}

	addCallback(callback) {
		this.validateCallback(callback);

		this.callbacks.add(callback);
	}

	async fire(response) {
		let fired = 0;

		for (let [, message] of response.Messages.entries()) {
			if (!this.type || message.data.type === this.type) {
				this.emit('message', message.data,  message, response, this);

				for (let [callback] of this.callbacks.entries()) {
					const type = Object.prototype.toString.call(callback);

					switch (type) {
						case '[object Function]':
							callback(message.data, message, response, this);
							break;
						case '[object AsyncFunction]':
							await callback(message.data, message, response, this);
							break;
					}
				}

				if (this.autoAck === true) {
					await this.ack(message);
				}

				++fired;
			}
		}

		!fired || this.emit('complete', fired, response, this);
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
				const response = await sqs.receiveMessageAsync({
					QueueUrl: this.queue_url,
					AttributeNames: [
						'All'
					],
					MaxNumberOfMessages: this.max_messages,
					VisibilityTimeout: 10,
					WaitTimeSeconds: 20
				});

				if (response && Array.isArray(response.Messages) && response.Messages.length) {
					log.info(`${MODULE_ID} SyndicationSQSQueueSubscribeSuccess =>`, {
						response,
						count: response.Messages.length
					});

					response.Messages.forEach(message => message.data = JSON.parse(message.Body));

					if (this.type) {
						response.Messages = response.Messages.filter(message => message.data.type === this.type);
					}

					if (response.Messages.length) {
						this.emit('messages', response, this);

						await this.fire(response);
					}
				}

				let tid = setTimeout(() => {
					this.onStart();

					clearTimeout(tid);

					tid = null;
				}, 100);
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
