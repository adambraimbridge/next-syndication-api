'use strict';

const util = require('util');

const aws = require('aws-sdk');

const __proto__ = Object.getPrototypeOf(new aws.SQS({
	region: process.env.AWS_REGION || 'eu-west-1'
}));

if (exports.promisified !== true) {
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
	].forEach(fn =>
		__proto__[`${fn}Async`] = util.promisify(__proto__[fn]));
}

exports.promisified = true;
