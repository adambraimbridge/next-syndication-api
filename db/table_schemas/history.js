'use strict';

module.exports = exports = {
	TableName: 'ft-next-syndication-history',
	AttributeDefinitions: [
		{ AttributeName: '_id', AttributeType: 'S' },
		{ AttributeName: 'content_id', AttributeType: 'S' },
		{ AttributeName: 'contract_id', AttributeType: 'S' },
		{ AttributeName: 'contributor_content', AttributeType: 'BOOL' },
		{ AttributeName: 'download_format', AttributeType: 'S' },
		// state is a reserved word in DynamoDB!!! X^@
		{ AttributeAlias: 'item_state', AttributeName: 'state', AttributeType: 'S' },
		{ AttributeName: 'licence_id', AttributeType: 'S' },
		{ AttributeName: 'syndication_state', AttributeType: 'S' },
		{ AttributeName: 'time', AttributeType: 'S' },
		{ AttributeName: 'title', AttributeType: 'S' },
		{ AttributeName: 'user_id', AttributeType: 'S' },
		{ AttributeName: 'version', AttributeType: 'S' }
	]
};