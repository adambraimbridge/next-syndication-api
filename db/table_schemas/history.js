'use strict';

module.exports = exports = {
	TableName: 'ft-next-syndication-history',
	AttributeDefinitions: [
		{ AttributeName: '_id', AttributeType: 'S' },
		{ AttributeName: 'content_id', AttributeType: 'S' },
		{ AttributeName: 'content_type', AttributeType: 'S' },
		{ AttributeName: 'contract_id', AttributeType: 'S' },
		{ AttributeName: 'contributor_content', AttributeType: 'BOOL', DefaultValue: false },
		{ AttributeName: 'download_format', AttributeType: 'S' },
		// state is a reserved word in DynamoDB!!! X^@
		{ AttributeAlias: 'item_state', AttributeName: 'state', AttributeType: 'S' },
		{ AttributeName: 'licence_id', AttributeType: 'S' },
		{ AttributeName: 'published_date', AttributeType: 'S' },
		{ AttributeName: 'syndication_state', AttributeType: 'S' },
		{ AttributeName: 'time', AttributeType: 'S' },
		{ AttributeName: 'title', AttributeType: 'S' },
		{
			AttributeName: 'user', AttributeType: 'M',
			AttributeDefinitions: [
				{ AttributeName: 'email', AttributeType: 'S' },
				{ AttributeName: 'first_name', AttributeType: 'S' },
				{ AttributeName: 'id', AttributeType: 'S' },
				{ AttributeName: 'surname', AttributeType: 'S' }
			]
		},
		{ AttributeName: 'version', AttributeType: 'S' }
	]
};
