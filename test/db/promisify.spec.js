'use strict';

const path = require('path');

const { expect } = require('chai');

const {
	TEST: { FIXTURES_DIRECTORY }
} = require('config');

const AWS = require('aws-sdk');

const underTest = require('../../db/promisify');

const __proto_db__ = Object.getPrototypeOf(new AWS.DynamoDB());
const __proto_client__ = Object.getPrototypeOf(new AWS.DynamoDB.DocumentClient());

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe(MODULE_ID, function () {

	it('promisified to be true', function () {
		expect(underTest.promisified).to.be.true;
	});

	describe('AWS.DynamoDB', function() {
		[
			'createTable',
			'deleteItem',
			'deleteTable',
			'getItem',
			'listTables',
			'putItem',
			'query',
			'scan',
			'updateItem',
			'updateTable'
		].forEach(fn => {
			it(`AWS.DynamoDB.prototype.${fn}Async should be a function`, function () {
				expect(__proto_db__[`${fn}Async`]).to.be.a('function');
			});
		});
	});

	describe('AWS.DynamoDB.DocumentClient', function() {
		[
			'delete',
			'get',
			'put',
			'query',
			'scan',
			'update'
		].forEach(fn => {
			it(`AWS.DynamoDB.DocumentClient.prototype.${fn}Async should be a function`, function () {
				expect(__proto_client__[`${fn}Async`]).to.be.a('function');
			});
		});
	});
});
