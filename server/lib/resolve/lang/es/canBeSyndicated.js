'use strict';

module.exports = exports = (val, prop, item = {}, existing = {}, contract) => {
	const content_area = Object.prototype.hasOwnProperty.call(item, 'content_area')
						? item.content_area.toLowerCase()
						: Object.prototype.hasOwnProperty.call(existing, 'content_area')
						? existing.content_area.toLowerCase()
						: null;

	if ((content_area === 'spanish content' && contract.allowed.spanish_content)
	|| (content_area === 'spanish weekend' && contract.allowed.spanish_weekend)) {
		return 'yes';
	}

	return 'verify';
};
