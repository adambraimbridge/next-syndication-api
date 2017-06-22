'use strict';

require('./promisify');

const log = require('@financial-times/n-logger').default;

const AWS = require('aws-sdk');

const {
    AWS_ACCESS_KEY,
    AWS_REGION = 'eu-west-1',
    AWS_SECRET_ACCESS_KEY,
    SYNDICATION_DOWNLOAD_SQS_URL: DEFAULT_QUEUE_URL
} = require('config');

const sqs = new AWS.SQS({
    accessKeyId: AWS_ACCESS_KEY,
    region: AWS_REGION,
    secretAccessKey: AWS_SECRET_ACCESS_KEY
});

const purgeQueue = async (params = { QueueUrl: DEFAULT_QUEUE_URL }) => {
    try {
        let data = await sqs.purgeQueueAsync(params);

        log.info('SyndicationSQSQueuePurgeSuccess', {data, params});

        return true;
    }
    catch (e) {
        log.error('SyndicationSQSQueuePurgeError', {
            err: e.stack,
            params
        });

        return false;
    }
};

module.exports = exports = purgeQueue;
