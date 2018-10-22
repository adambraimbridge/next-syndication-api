'use strict';

const canDownload = require('../../canDownload');

module.exports = exports = (val, prop, item = {}, existing = {}, contract) => {
	if (Object.prototype.hasOwnProperty.call(item, prop)) {
		val = item[prop];
	} else if (Object.prototype.hasOwnProperty.call(existing, prop)) {
		val = existing[prop];
	} else {
		val = canDownload(val, prop, item, existing, contract);
	}

	const content_area = Object.prototype.hasOwnProperty.call(
		item,
		'content_area'
	)
		? item.content_area.toLowerCase()
		: Object.prototype.hasOwnProperty.call(existing, 'content_area')
			? existing.content_area.toLowerCase()
			: null;

	if (content_area === 'spanish content' && contract.allowed.spanish_content) {
		return val < 0 ? val : 1;
	} else if (
		content_area === 'spanish weekend' &&
		contract.allowed.spanish_weekend
	) {
		return val < 0 ? val : 1;
	}

	return 0;
};
