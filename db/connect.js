'use strict';

require('./promisify');

const AWS = require('./aws');

const db = new AWS.DynamoDB();

const client = new AWS.DynamoDB.DocumentClient();

module.exports = exports = { client, db };
