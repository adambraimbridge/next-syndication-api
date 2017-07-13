'use strict';

module.exports = exports = {
	TableName: 'ft-next-syndication-history',
	KeySchema: [
		{ AttributeName: '_id', KeyType: 'HASH' }
	],
	AttributeDefinitions: [
		{ AttributeName: '_id', AttributeType: 'S' }
	],
	ProvisionedThroughput: {
		ReadCapacityUnits: 10,
		WriteCapacityUnits: 10
	}
};
