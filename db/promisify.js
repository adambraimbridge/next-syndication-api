'use strict';

const util = require('util');

const AWS = require('aws-sdk');

const __proto_db__ = Object.getPrototypeOf(new AWS.DynamoDB());
const __proto_client__ = Object.getPrototypeOf(new AWS.DynamoDB.DocumentClient());

if (exports.promisified !== true) {
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
	].forEach(fn =>
		__proto_db__[`${fn}Async`] = util.promisify(__proto_db__[fn]));

	[
		'delete',
		'get',
		'put',
		'query',
		'scan',
		'update'
	].forEach(fn =>
		__proto_client__[`${fn}Async`] = util.promisify(__proto_client__[fn]));
}

exports.promisified = true;
