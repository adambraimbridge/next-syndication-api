'use strict';

require('./promisify');

const log = require('@financial-times/n-logger').default;

const AWS = require('aws-sdk');

const sqs = new AWS.SQS({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    region: process.env.AWS_REGION || 'eu-west-1',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const purgeQueue = async (params = {QueueUrl: process.env.SYNDICATION_DOWNLOAD_SQS_URL}) => {
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
