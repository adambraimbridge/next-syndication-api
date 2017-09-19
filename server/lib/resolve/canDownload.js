'use strict';

const downloaded = require('./downloaded');
const type = require('./type');

module.exports = exports = (val, prop, item, existing, contract) => {
	if (downloaded(undefined, 'downloaded', item, existing, contract)) {
		return 1;
	}

	let content_type = item.content_type || item.content_type || type(item.type, 'type', item, existing, contract);

	if (contract && contract.assetsMap) {
		const asset = contract.assetsMap[content_type];

		if (!asset) {
			return 0;
		}

		if (asset.download_limit > -1) {
			if (asset.download_limit - asset.current_downloads.total > 0) {
				return 1;
			}
			else {
				return -1;
			}
		}
	}

	return 0;
};
