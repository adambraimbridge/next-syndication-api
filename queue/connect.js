'use strict';

require('./promisify');

const AWS = require('aws-sdk');

const {
	AWS_ACCESS_KEY,
	AWS_REGION = 'eu-west-1',
	AWS_SECRET_ACCESS_KEY
} = require('config');

const sqs = new AWS.SQS({
	accessKeyId: AWS_ACCESS_KEY,
	region: AWS_REGION,
	secretAccessKey: AWS_SECRET_ACCESS_KEY
});

module.exports = exports = sqs;
