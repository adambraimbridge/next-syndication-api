'use strict';

const path = require('path');

const { expect } = require('chai');

const AWS = require('aws-sdk');

const { AWS_ACCESS_KEY, AWS_SECRET_ACCESS_KEY } = require('config');

const underTest = require('../../db/connect');

const MODULE_ID =
	path.relative(`${process.cwd()}/test`, module.id) ||
	require(path.resolve('./package.json')).name;

describe(MODULE_ID, function() {
	it('db should be an instance of AWS.DynamoDB', function() {
		expect(underTest.db).to.be.an.instanceOf(AWS.DynamoDB);
	});

	it('db should have the correct credentials', function() {
		expect(underTest.db.config.accessKeyId).to.equal(AWS_ACCESS_KEY);

		expect(underTest.db.config.region).to.equal('eu-west-1');

		expect(underTest.db.config.secretAccessKey).to.equal(AWS_SECRET_ACCESS_KEY);
	});

	it('client should be an instance of AWS.DynamoDB.DocumentClient', function() {
		expect(underTest.client).to.be.an.instanceOf(AWS.DynamoDB.DocumentClient);
	});

	it('client.service === db', function() {
		expect(underTest.client)
			.to.have.property('service')
			.and.to.be.an.instanceOf(AWS.DynamoDB);

		expect(underTest.client.service.config.endpoint).and.to.equal(
			underTest.db.config.endpoint
		);
	});
});
