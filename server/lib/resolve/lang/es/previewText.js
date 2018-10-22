'use strict';

module.exports = exports = (val, prop, item) => {
	if (!item.document) {
		return;
	}

	const previewText = item.document.childNodes[0].childNodes[1].textContent.trim();

	return previewText.length <= 105
		? previewText
		: previewText.substring(0, 105) + '...';
};
