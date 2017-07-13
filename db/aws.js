'use strict';

const AWS = require('aws-sdk');

const {
	AWS_ACCESS_KEY,
	AWS_REGION = 'eu-west-1',
	AWS_SECRET_ACCESS_KEY,
	DEFAULT_DB_ENDPOINT
} = require('config');

AWS.config.update({
	accessKeyId: AWS_ACCESS_KEY,
	endpoint: DEFAULT_DB_ENDPOINT,
	region: AWS_REGION,
	secretAccessKey: AWS_SECRET_ACCESS_KEY
});

module.exports = exports = AWS;
