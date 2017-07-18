'use strict';

module.exports = exports = {
	TableName: 'ft-next-syndication-contracts',
	AttributeDefinitions: [
		{ AttributeName: 'contract_number', AttributeType: 'S' },
		{ AttributeName: 'contract_ends', AttributeType: 'S' },
		{ AttributeName: 'contract_starts', AttributeType: 'S' },
		{ AttributeName: 'contributor_content', AttributeType: 'N' },
		{ AttributeName: 'client_publications', AttributeType: 'S' },
		{ AttributeName: 'client_website', AttributeType: 'S' },
		{ AttributeName: 'licencee_name', AttributeType: 'S' },
		{ AttributeName: 'limit_article', AttributeType: 'N' },
		{ AttributeName: 'limit_podcast', AttributeType: 'N' },
		{ AttributeName: 'limit_video', AttributeType: 'N' },
		{ AttributeName: 'owner_name', AttributeType: 'S' },
		{ AttributeName: 'owner_email', AttributeType: 'S' },
		{ AttributeName: 'assets', AttributeType: 'S' }
	]
};
