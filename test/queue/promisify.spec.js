'use strict';

const path = require('path');

const { expect } = require('chai');

const AWS = require('aws-sdk');

const underTest = require('../../queue/promisify');

let __proto__ = Object.getPrototypeOf(new AWS.SQS({}));

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe(MODULE_ID, function () {

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
    });
});
