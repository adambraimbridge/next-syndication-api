'use strict';

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

const AWS = require('aws-sdk');

const underTest = require('../../queue/publish');

const { expect } = chai;

chai.use(sinonChai);

const __proto__ = Object.getPrototypeOf(new AWS.SQS({}));

describe('queue/publish', function () {
	before(function () {
		sinon.spy(__proto__, 'sendMessageAsync');
	});

	after(function () {
		__proto__.sendMessageAsync.restore();
	});

	it('should use the default `QueueUrl` when ', async function () {
		let event = {};

		await underTest({ event });

		expect(__proto__.sendMessageAsync).to.be.calledWith({
			MessageBody: JSON.stringify(event),
			QueueUrl: process.env.SYNDICATION_DOWNLOAD_SQS_URL
		});
	});

	it('should allow passing a different `QueueUrl`', async function () {
		let event = {};
		let queue_url = 'https://i.dont.exist/queue';

		await underTest({ event, queue_url });

		expect(__proto__.sendMessageAsync).to.be.calledWith({
			MessageBody: JSON.stringify(event),
			QueueUrl: queue_url
		});
	});

	it('should return true for a successful publish', async function () {
		let event = {};

		let success = await underTest({ event });

		expect(success).to.be.true;
	});

	it('should return false for a failed publish', async function () {
		let event = {};
		let queue_url = 'https://i.dont.exist/queue';

		let success = await underTest({ event, queue_url });

		expect(success).to.be.false;
	});

	it('allows passing a custom format queue message function', async function () {
		let event = {};
		let queue_url = 'https://i.dont.exist/queue';

		let format = sinon.stub();

		await underTest({ event, format, queue_url });

		expect(format).to.be.calledOnce;

		expect(format).to.be.calledWith(event);
	});

});
