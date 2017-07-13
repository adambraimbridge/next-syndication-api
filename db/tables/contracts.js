'use strict';

module.exports = exports = {
	TableName: 'ft-next-syndication-contracts',
	KeySchema: [
		{ AttributeName: 'contract_number', KeyType: 'HASH' }
	],
	AttributeDefinitions: [
		{ AttributeName: 'contract_number', AttributeType: 'S' }
	],
	ProvisionedThroughput: {
		ReadCapacityUnits: 10,
		WriteCapacityUnits: 10
	}
};
