'use strict';

const {default: logger} = require('@financial-times/n-logger');
const {ASSET_TYPE_TO_CONTENT_TYPE} = require('config');

module.exports = exports = SFContract => {
	const contract = {
		contract_id: SFContract.contractNumber,
		contributor_content: SFContract.contributor,
		start_date: SFContract.startDate,
		end_date: SFContract.endDate,
		licencee_name: SFContract.licenceeName,
		client_publications: SFContract.clientWebsite,
		client_website: SFContract.clientPublications,
		owner_email: SFContract.ownerEmail,
		owner_name: SFContract.ownerName,
		assets: [],
	};

	contract.assets = SFContract.assets
		.filter(({ assetType }) => assetType !== 'Addendum')
		.map(formatAsset)
		.map(asset => {
			asset.download_limit = SFContract[`${asset.content_type}Limit`];
			return asset;
		});

	SFContract.assets
		.filter(({ assetType }) => assetType === 'Addendum')
		.map(formatAsset)
		.forEach(addendum => {
			const asset = findMatchingAsset(addendum, contract);

			if (!asset) {
				logger.error(
					new ReferenceError(
						`Asset not found for Addendum: ${JSON.stringify(
							addendum
						)}`
					)
				);
				return;
			}

			asset.addendums = Array.isArray(asset.addendums)
				? asset.addendums
				: [];
			asset.addendums.push(cleanupAddendum(addendum));

			if (
				addendum.embargo_period &&
				(!asset.embargo_period ||
					addendum.embargo_period > asset.embargo_period)
			) {
				asset.embargo_period = addendum.embargo_period;
			}
		});

	contract.assets.forEach(item => delete item.content_set);

	return contract;
};

function formatAsset(item) {
	return {
		asset_class: item.assetType,
		asset_id: item.assetId,
		asset_type: item.assetName,
		content_type: ASSET_TYPE_TO_CONTENT_TYPE[item.assetName],
		product: item.productName,
		print_usage_period: item.maxPermittedPrintUsagePeriod || 'Year',
		print_usage_limit: item.maxPermittedPrintUsage,
		online_usage_period: item.maxPermittedOnlineUsagePeriod || 'Year',
		online_usage_limit: item.maxPermittedOnlineUsage,
		embargo_period: item.embargoPeriod || 0,
		content_set: item.contentSet,
		content:
			typeof item.contentSet === 'string'
				? item.contentSet.split(';').map(item => item.trim())
				: [],
		addendums: [],
	};
}

function findMatchingAsset(addendum, contract) {
	let asset = contract.assets.find(asset => asset.content_type === addendum.content_type && asset.content_set === addendum.content_set);
	if (!asset) {
		asset = contract.assets.find(asset => asset.content_type === addendum.content_type);
	}
	return asset
}

function cleanupAddendum(item) {
	delete item.addendums;
	delete item.asset_class;
	delete item.asset_type;
	delete item.content;
	delete item.content_set;
	delete item.content_type;
	delete item.product;

	return item;
}
