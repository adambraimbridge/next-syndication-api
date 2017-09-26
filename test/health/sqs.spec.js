'use strict';

const fs = require('fs');
const path = require('path');

const chai = require('chai');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

const AWS = require('aws-sdk');
const moment = require('moment');

const {
	HEALTH_CHECK_HISTORY,
	SYNDICATION_DOWNLOAD_SQS_URL: DEFAULT_QUEUE_URL
} = require('config');

const { expect } = chai;

chai.use(sinonChai);

const __proto__ = Object.getPrototypeOf(new AWS.SQS({}));

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe(MODULE_ID, function () {
	let fsStub;
	let sqsStub;
	let underTest;

	before(function () {
		fsStub = sinon.stub(fs, 'writeFile').callsFake((x, y, z, cb) => cb(null, {}));

		sqsStub = sinon.stub(__proto__, 'getQueueAttributesAsync').resolves({
			Attributes: {
				ApproximateNumberOfMessages: '0',
				ApproximateNumberOfMessagesDelayed: '0'
			}
		});

		underTest = proxyquire('../../health/sqs', {
			fs: {
				writeFile: fsStub
			}
		});
	});

	after(function () {
		fsStub.restore();
		sqsStub.restore();
	});

	describe('#tick', function () {
		it('calls SQS.getQueueAttributes to get the current queue count', async function () {
			await underTest.tick();

			expect(sqsStub).to.have.been.calledWith({
				AttributeNames: [
					'ApproximateNumberOfMessages',
					'ApproximateNumberOfMessagesDelayed'
				],
				QueueUrl: DEFAULT_QUEUE_URL
			});
		});

		it('writes a file so it can compare queue history', async function () {
			await underTest.tick();

			const file_path = path.resolve(HEALTH_CHECK_HISTORY.directory, 'sqs', moment().format(HEALTH_CHECK_HISTORY.file_date_format));

			const data = JSON.stringify({
				ApproximateNumberOfMessages: 0,
				ApproximateNumberOfMessagesDelayed: 0,
				total: 0
			}, null, 4);

			expect(fsStub).to.have.been.calledWith(file_path, data, 'utf8');
		});
	});
});
