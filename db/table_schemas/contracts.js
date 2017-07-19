'use strict';

module.exports = exports = {
	TableName: 'ft-next-syndication-contracts',
	AttributeDefinitions: [
		{ AttributeAlias: 'contract_number', AttributeName: 'contractNumber', AttributeType: 'S' },
		{ AttributeAlias: 'contract_ends', AttributeName: 'endDate', AttributeType: 'S' },
		{ AttributeAlias: 'contract_starts', AttributeName: 'startDate', AttributeType: 'S' },
		{ AttributeAlias: 'contributor_content', AttributeName: 'contributor', AttributeType: 'BOOL' },
		{ AttributeAlias: 'client_publications', AttributeName: 'clientPublications', AttributeType: 'S' },
		{ AttributeAlias: 'client_website', AttributeName: 'clientWebsite', AttributeType: 'S' },
		{ AttributeAlias: 'licencee_name', AttributeName: 'licenceeName', AttributeType: 'S' },
		{ AttributeAlias: 'limit_article', AttributeName: 'articleLimit', AttributeType: 'N' },
		{ AttributeAlias: 'limit_podcast', AttributeName: 'podcastLimit', AttributeType: 'N' },
		{ AttributeAlias: 'limit_video', AttributeName: 'videoLimit', AttributeType: 'N' },
		{ AttributeAlias: 'owner_name', AttributeName: 'ownerName', AttributeType: 'S' },
		{ AttributeAlias: 'owner_email', AttributeName: 'ownerEmail', AttributeType: 'S' },
		{ AttributeAlias: 'last_updated', AttributeName: 'last_updated', AttributeType: 'S' },
		{
			AttributeAlias: 'assets', AttributeName: 'assets', AttributeType: 'L',
			AttributeDefinitions: [
				{ AttributeAlias: 'product', AttributeName: 'productName', AttributeType: 'S' },
				{ AttributeAlias: 'print_usage_period', AttributeName: 'maxPermittedPrintUsagePeriod', AttributeType: 'S' },
				{ AttributeAlias: 'print_usage_limit', AttributeName: 'maxPermittedPrintUsage', AttributeType: 'N' },
				{ AttributeAlias: 'online_usage_period', AttributeName: 'maxPermittedOnlineUsagePeriod', AttributeType: 'S' },
				{ AttributeAlias: 'online_usage_limit', AttributeName: 'maxPermittedOnlineUsage', AttributeType: 'N' },
				{ AttributeAlias: 'embargo_period', AttributeName: 'embargoPeriod', AttributeType: 'N' },
				{ AttributeAlias: 'content', AttributeName: 'contentSet', AttributeType: 'S' },
				{ AttributeAlias: 'asset', AttributeName: 'assetName', AttributeType: 'S' }
			]
		}
	]
};
