'use strict';

const downloaded = require('./downloaded');
const type = require('./type');

module.exports = exports = (val, prop, item, existing, contract) => {
	if (downloaded(undefined, 'downloaded', item, existing, contract)) {
		return 1;
	}

	let content_type = item.content_type || (existing || {}).content_type || type(item.type, 'type', item, existing, contract);

	if (contract && contract.itemsMap) {
		const asset = contract.itemsMap[content_type];

		if (!asset) {
			return 0;
		}

		if (asset.download_limit > -1) {
			const downloaded_total = asset.current_downloads.total + (asset.legacy_download_count || 0)
			if (asset.download_limit - downloaded_total > 0) {
				return 1;
			}
			else {
				return -1;
			}
		}
	}

	return 0;
};
