'use strict';

const { ASSET_TYPE_TO_CONTENT_TYPE } = require('config');

module.exports = exports = {
	clean: true,
	items: [{
		cite: 'contractNumber',
		id: 'contract_id'
	}, {
		cite: 'endDate',
		id: 'end_date'
	}, {
		cite: 'startDate',
		id: 'start_date'
	}, {
		cite: 'contributor',
		id: 'contributor_content'
	}, {
		cite: 'licenceeName',
		id: 'licencee_name'
	}, {
		cite: 'clientPublications',
		id: 'client_publications'
	}, {
		cite: 'clientWebsite',
		id: 'client_website'
	}, {
		cite: 'ownerEmail',
		id: 'owner_email'
	}, {
		cite: 'ownerName',
		id: 'owner_name'
	}, {
		cite: 'assets',
		clean: true,
		id: 'assets',
		items: [{
			cite: 'assetType',
			default: 'New',
			id: 'assetType'
		}, {
			cite: 'assetName',
			id: 'asset_type'
		}, {
			delete: false,
			cite: 'asset_type',
			id: 'content_type',
			transform: (val) => ASSET_TYPE_TO_CONTENT_TYPE[val]
		}, {
			cite: 'productName',
			id: 'product'
		}, {
			cite: 'maxPermittedPrintUsagePeriod',
			id: 'print_usage_period'
		}, {
			cite: 'maxPermittedPrintUsage',
			id: 'print_usage_limit'
		}, {
			cite: 'maxPermittedOnlineUsagePeriod',
			id: 'online_usage_period'
		}, {
			cite: 'maxPermittedOnlineUsage',
			id: 'online_usage_limit'
		}, {
			cite: 'embargoPeriod',
			id: 'embargo_period'
		}, {
			cite: 'contentSet',
			id: 'content',
			transform: (val) => val.split(';').map(item => item.trim())
		}, {
			cite: '../articleLimit',
			condition: (item) => item.asset_type === 'FT Article',
			id: 'download_limit'
		}, {
			cite: '../podcastLimit',
			condition: (item) => item.asset_type === 'Podcast',
			id: 'download_limit'
		}, {
			cite: '../videoLimit',
			condition: (item) => item.asset_type === 'Video',
			id: 'download_limit'
		}]
	}]
};
