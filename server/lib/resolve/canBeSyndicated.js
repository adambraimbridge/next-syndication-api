'use strict';

const type = require('./type');

module.exports = exports = (val, prop, item, existing, contract) => {
	let content_type = item.content_type || (existing || {}).content_type || type(item.type, 'type', item, existing, contract);

	if (content_type === 'podcast') {
		if (contract && contract.itemsMap) {
			const asset = contract.itemsMap[content_type];

			if (asset && asset.download_limit > 0) {
				return 'yes';
			}
		}
	}

	return val;
};
