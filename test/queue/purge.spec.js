'use strict';

const path = require('path');

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

const AWS = require('aws-sdk');

const underTest = require('../../queue/purge');

const { expect } = chai;

chai.use(sinonChai);

const __proto__ = Object.getPrototypeOf(new AWS.SQS({}));

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe(MODULE_ID, function () {
	before(function () {
		sinon.spy(__proto__, 'purgeQueueAsync');
	});

	after(function () {
		__proto__.purgeQueueAsync.restore();
	});

	it('should return true for a successful purge', async function () {
		let success = await underTest({
			QueueUrl: process.env.SYNDICATION_DOWNLOAD_SQS_URL
		});

		expect(success).to.be.true;
	});

	it('should return false for a failed purge', async function () {
		let success = await underTest({
			QueueUrl: 'https://i.dont.exist/queue'
		});

		expect(success).to.be.false;
	});

	it('should use the default `QueueUrl` when none is given', async function () {
		await underTest();

		expect(__proto__.purgeQueueAsync).to.be.calledWith({
			QueueUrl: process.env.SYNDICATION_DOWNLOAD_SQS_URL
		});
	});

	it('should allow passing a different `QueueUrl`', async function () {
		await underTest({
			QueueUrl: 'https://i.dont.exist/queue'
		});

		expect(__proto__.purgeQueueAsync).to.be.calledWith({
			QueueUrl: 'https://i.dont.exist/queue'
		});
	});

});
