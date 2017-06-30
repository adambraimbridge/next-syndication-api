'use strict';

const path = require('path');

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

const AWS = require('aws-sdk');

const { SYNDICATION_DOWNLOAD_SQS_URL: DEFAULT_QUEUE_URL } = require('config');

const underTest = require('../../queue/purge');

const { expect } = chai;

chai.use(sinonChai);

const __proto__ = Object.getPrototypeOf(new AWS.SQS({}));

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

const sleep = async (ms = 50) => new Promise((resolve) => {
	setTimeout(() => resolve(), ms);
});

describe(MODULE_ID, function () {
	let stub;

	afterEach(function () {
		stub.restore();
	});

	it('should return true for a successful purge', async function () {
		stub = sinon.stub(__proto__, 'purgeQueueAsync').callsFake(params => params);

		let success = await underTest({
			QueueUrl: DEFAULT_QUEUE_URL
		});

		expect(success).to.be.true;
	});

	it('should be throttled', async function () {
		stub = sinon.stub(__proto__, 'purgeQueueAsync').callsFake(params => params);

		let success = await underTest({
			QueueUrl: DEFAULT_QUEUE_URL
		});

		expect(success).to.be.equal(undefined);

		success = await underTest({
			QueueUrl: DEFAULT_QUEUE_URL
		});

		expect(success).to.be.equal(undefined);
	});

	it('should return false for a failed purge', async function () {
		await sleep();

		stub = sinon.stub(__proto__, 'purgeQueueAsync').throws(new Error('I do not exist'));

		let success = await underTest({
			QueueUrl: 'https://i.dont.exist/queue'
		});

		expect(success).to.be.false;
	});

	it('should use the default `QueueUrl` when none is given', async function () {
		await sleep();

		stub = sinon.stub(__proto__, 'purgeQueueAsync').callsFake(params => params);

		let success = await underTest();

		expect(success).to.be.true;

		expect(__proto__.purgeQueueAsync).to.be.calledWith({
			QueueUrl: DEFAULT_QUEUE_URL
		});
	});

	it('should allow passing a different `QueueUrl`', async function () {
		await sleep();

		stub = sinon.stub(__proto__, 'purgeQueueAsync').throws(new Error('I do not exist'));

		let success = await underTest({
			QueueUrl: 'https://i.dont.exist/queue'
		});

		expect(success).to.be.false;

		expect(__proto__.purgeQueueAsync).to.be.calledWith({
			QueueUrl: 'https://i.dont.exist/queue'
		});
	});

});
