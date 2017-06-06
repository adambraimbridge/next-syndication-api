'use strict';

const { expect } = require('chai');

const AWS = require('aws-sdk');

const underTest = require('../../queue/promisify');

let __proto__ = Object.getPrototypeOf(new AWS.SQS({}));

describe('queue/promisify', function () {

	it('promisified to be true', function () {
		expect(underTest.promisified).to.be.true;
	});

	[
		'deleteMessage',
		'deleteMessageBatch',
		'getQueueAttributes',
		'getQueueUrl',
		'purgeQueue',
		'receiveMessage',
		'sendMessage',
		'sendMessageBatch',
		'setQueueAttributes'
	].forEach(fn => {
		it(`AWS.SQS.prototype.${fn}Async should be a function`, function () {
			expect(__proto__[`${fn}Async`]).to.be.a('function');
		});
	})
});
