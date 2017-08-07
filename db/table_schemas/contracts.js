'use strict';

const DownloadLimitsByContentType = [
	{ AttributeName: 'article', AttributeType: 'N', DefaultValue: -1 },
	{ AttributeName: 'podcast', AttributeType: 'N', DefaultValue: -1 },
	{ AttributeName: 'video', AttributeType: 'N', DefaultValue: -1 },
	{ AttributeName: 'total', AttributeType: 'N', DefaultValue: -1 }
];

module.exports = exports = {
	TableName: 'ft-next-syndication-contracts',
	AttributeDefinitions: [
		{ AttributeAlias: 'contract_number', AttributeName: 'contractNumber', AttributeType: 'S' },
		{ AttributeAlias: 'contract_ends', AttributeName: 'endDate', AttributeType: 'S' },
		{ AttributeAlias: 'contract_starts', AttributeName: 'startDate', AttributeType: 'S' },
		{ AttributeAlias: 'contributor_content', AttributeName: 'contributor', AttributeType: 'BOOL', DefaultValue: false },
		{ AttributeAlias: 'client_publications', AttributeName: 'clientPublications', AttributeType: 'S' },
		{ AttributeAlias: 'client_website', AttributeName: 'clientWebsite', AttributeType: 'S' },
		{ AttributeAlias: 'licencee_name', AttributeName: 'licenceeName', AttributeType: 'S' },
//		{ AttributeAlias: 'limit_article', AttributeName: 'articleLimit', AttributeType: 'N', DefaultValue: 0  },
//		{ AttributeAlias: 'limit_podcast', AttributeName: 'podcastLimit', AttributeType: 'N', DefaultValue: 0 },
//		{ AttributeAlias: 'limit_video', AttributeName: 'videoLimit', AttributeType: 'N', DefaultValue: 0 },
		{
			AttributeName: 'limits', AttributeType: 'M',
			AttributeDefinitions: JSON.parse(JSON.stringify(DownloadLimitsByContentType))
		},
		{ AttributeAlias: 'owner_name', AttributeName: 'ownerName', AttributeType: 'S' },
		{ AttributeAlias: 'owner_email', AttributeName: 'ownerEmail', AttributeType: 'S' },
		{ AttributeAlias: 'last_updated', AttributeName: 'last_updated', AttributeType: 'S' },
		{
			AttributeAlias: 'assets', AttributeName: 'assets', AttributeType: 'L',
			AttributeDefinitions: [
				{ AttributeAlias: 'product', AttributeName: 'productName', AttributeType: 'S' },
				{ AttributeAlias: 'print_usage_period', AttributeName: 'maxPermittedPrintUsagePeriod', AttributeType: 'S' },
				{ AttributeAlias: 'print_usage_limit', AttributeName: 'maxPermittedPrintUsage', AttributeType: 'N', DefaultValue: 0 },
				{ AttributeAlias: 'online_usage_period', AttributeName: 'maxPermittedOnlineUsagePeriod', AttributeType: 'S' },
				{ AttributeAlias: 'online_usage_limit', AttributeName: 'maxPermittedOnlineUsage', AttributeType: 'N', DefaultValue: 0 },
				{ AttributeAlias: 'embargo_period', AttributeName: 'embargoPeriod', AttributeType: 'N', DefaultValue: 0 },
				{ AttributeAlias: 'content', AttributeName: 'contentSet', AttributeType: 'S' },
				{ AttributeAlias: 'asset', AttributeName: 'assetName', AttributeType: 'S' }
			]
		},
		{
			AttributeName: 'download_count', AttributeType: 'M',
			AttributeDefinitions: [ {
				AttributeName: 'legacy', AttributeType: 'M',
				AttributeDefinitions: JSON.parse(JSON.stringify(DownloadLimitsByContentType))
			}, {
				AttributeName: 'remaining', AttributeType: 'M',
				AttributeDefinitions: JSON.parse(JSON.stringify(DownloadLimitsByContentType))
			}, {
				AttributeName: 'total', AttributeType: 'M',
				AttributeDefinitions: JSON.parse(JSON.stringify(DownloadLimitsByContentType))
			}, {
				AttributeName: 'current', AttributeType: 'M',
				AttributeDefinitions: [ {
					AttributeName: 'day', AttributeType: 'M',
					AttributeDefinitions: JSON.parse(JSON.stringify(DownloadLimitsByContentType))
				}, {
					AttributeName: 'week', AttributeType: 'M',
					AttributeDefinitions: JSON.parse(JSON.stringify(DownloadLimitsByContentType))
				}, {
					AttributeName: 'month', AttributeType: 'M',
					AttributeDefinitions: JSON.parse(JSON.stringify(DownloadLimitsByContentType))
				}, {
					AttributeName: 'year', AttributeType: 'M',
					AttributeDefinitions: JSON.parse(JSON.stringify(DownloadLimitsByContentType))
				} ]
			}/*, {
				AttributeName: 'archive', AttributeType: 'L',
				AttributeDefinitions: [
					{ AttributeName: 'year', AttributeType: 'N' },
					{
						AttributeName: 'breakdown', AttributeType: 'M',
						AttributeDefinitions: [
							{ AttributeName: 'year', AttributeType: 'N' },
							{ AttributeName: 'months', AttributeType: 'L', AttributeItemTypes: 'N' },
							{ AttributeName: 'weeks', AttributeType: 'L', AttributeItemTypes: 'N' },
							{ AttributeName: 'days', AttributeType: 'L', AttributeItemTypes: 'N' }
						]
					}
				]
			}*/ ]
		},
		{ AttributeName: 'download_formats', AttributeType: 'M' }
	]
};
