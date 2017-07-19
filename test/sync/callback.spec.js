'use strict';

const path = require('path');

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const proxyquire = require('proxyquire');

const {
	TEST: { FIXTURES_DIRECTORY }
} = require('config');


const MessageQueueEvent = require('../../queue/message-queue-event');
const QueueSubscriber = require('../../queue/subscriber');

const { expect } = chai;
chai.use(sinonChai);

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe(MODULE_ID, function () {
	let underTest;
	let persist;
	let subscriber;

	afterEach(function () {
		QueueSubscriber.prototype.ack.restore();
	});

	beforeEach(function () {
		persist = sinon.stub();

		underTest = proxyquire('../../sync/callback', {
			'./persist': persist
		});

		sinon.stub(QueueSubscriber.prototype, 'ack').resolves({});

		subscriber = new QueueSubscriber({});
	});

	it('persists a message queue event', async function () {
		const event = (new MessageQueueEvent({
			event: {
				content_id: 'http://www.ft.com/thing/abc',
				contract_id: 'syndication',
				download_format: 'docx',
				licence_id: 'foo',
				state: 'save',
				time: new Date(),
				user_id: 'bar'
			}
		})).toJSON();

		const message = { data: event };

		await underTest(event, message, {}, subscriber);

		expect(persist).to.be.calledWith(event);
	});

	it('removes it from the queue', async function () {
		const event = (new MessageQueueEvent({
			event: {
				content_id: 'http://www.ft.com/thing/abc',
				contract_id: 'syndication',
				download_format: 'docx',
				licence_id: 'foo',
				state: 'save',
				time: new Date(),
				user_id: 'bar'
			}
		})).toJSON();

		const message = { data: event };

		await underTest(event, message, {}, subscriber);

		expect(QueueSubscriber.prototype.ack).to.be.calledWith(message);
	});
});
