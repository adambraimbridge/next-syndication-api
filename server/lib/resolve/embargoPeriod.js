'use strict';

const moment = require('moment');

module.exports = exports = (val, prop, item, existing, contract) => {
	const asset =
		contract.itemsMap[item.type] ||
		contract.itemsMap[item.content_type] ||
		contract.itemsMap[item.contentType] ||
		contract.itemsMap[(existing || {}).content_type];

	if (asset && asset.embargo_period) {
		const date = moment(item.firstPublishedDate || item.publishedDate);

		const now = moment();

		if (date.add(asset.embargo_period, 'days').isAfter(now, 'day')) {
			return asset.embargo_period;
		}
	}

	return null;
};
