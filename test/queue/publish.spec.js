'use strict';

const path = require('path');

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

const AWS = require('aws-sdk');

const MessageQueueEvent = require('../../queue/message-queue-event');
const underTest = require('../../queue/publish');

const { expect } = chai;

chai.use(sinonChai);

const __proto__ = Object.getPrototypeOf(new AWS.SQS({}));

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe(MODULE_ID, function () {
	let stub;

	describe('success', function() {
		beforeEach(function () {
			stub = sinon.stub(__proto__, 'sendMessageAsync').callsFake(transport => transport);
		});

		afterEach(function () {
			stub.restore();
		});

		it('should use the default `QueueUrl` when none is given', async function () {
			let event = new MessageQueueEvent();

			await underTest(event);

			expect(__proto__.sendMessageAsync).to.be.calledWith(event.toSQSTransport());
		});

		it('should allow passing a different `QueueUrl`', async function () {
			let event = new MessageQueueEvent({
				queue_url: 'https://i.dont.exist/queue'
			});

			await underTest(event);

			expect(__proto__.sendMessageAsync).to.be.calledWith(event.toSQSTransport());
		});

		it('should return true for a successful publish', async function () {
			let event = new MessageQueueEvent();

			let success = await underTest(event);

			expect(success).to.be.true;
		});
	});

	describe('fail', function() {
		beforeEach(function () {
			stub = sinon.stub(__proto__, 'sendMessageAsync').throws(new Error('I do not exist'));
		});

		afterEach(function () {
			stub.restore();
		});

		it('should return false for a failed publish', async function () {
			let event = new MessageQueueEvent({
				queue_url: 'https://i.dont.exist/queue'
			});

			let success = await underTest(event);

			expect(success).to.be.false;
		});

		it('should return false if a MessageQueueEvent is not passed', async function () {
			let event = {
				content_id: 'abc',
				content_uri: 'https://ft.com/content/abc',
				download_format: 'docx',
				licence_id: 'foo',
				state: 'saved',
				time: new Date(),
				tracking: {
					cookie: 'cookie',
					ip_address: '127.0.0.1',
					referrer: '/republishing/contract',
					session: 'session',
					spoor_id: 'spoor-id',
					url: '/republishing/contract',
					user_agent: 'user-agent'
				},
				user: {
					email: 'foo@bar.com',
					first_name: 'foo',
					id: 'bar',
					lastName: 'bar'
				}
			};

			let success = await underTest(event);

			expect(success).to.be.false;
		});
	});

});
