'use strict';

const util = require('util');

const aws = require('aws-sdk');

const { AWS_REGION = 'eu-west-1' } = require('config');

const __proto__ = Object.getPrototypeOf(new aws.SQS({
	region: AWS_REGION
}));

if (exports.promisified !== true) {
	[
		'deleteMessage',
		'deleteMessageBatch',
		'getQueueAttributes',
		'getQueueUrl',
		'listQueues',
		'purgeQueue',
		'receiveMessage',
		'sendMessage',
		'sendMessageBatch',
		'setQueueAttributes'
	].forEach(fn =>
		__proto__[`${fn}Async`] = util.promisify(__proto__[fn]));
}

exports.promisified = true;
