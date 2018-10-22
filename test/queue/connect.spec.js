'use strict';

const path = require('path');

const { expect } = require('chai');

const AWS = require('aws-sdk');

const { AWS_ACCESS_KEY, AWS_SECRET_ACCESS_KEY } = require('config');

const underTest = require('../../queue/connect');

const MODULE_ID =
	path.relative(`${process.cwd()}/test`, module.id) ||
	require(path.resolve('./package.json')).name;

describe(MODULE_ID, function() {
	it('should be an instance of AWS.SQS', function() {
		expect(underTest).to.be.an.instanceOf(AWS.SQS);
	});

	it('should have the correct credentials', function() {
		expect(underTest.config.accessKeyId).to.equal(AWS_ACCESS_KEY);

		expect(underTest.config.region).to.equal('eu-west-1');

		expect(underTest.config.secretAccessKey).to.equal(AWS_SECRET_ACCESS_KEY);
	});
});
