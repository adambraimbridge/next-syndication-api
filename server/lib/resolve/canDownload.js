'use strict';

const downloaded = require('./downloaded');
const type = require('./type');

module.exports = exports = (val, prop, item, existing, contract) => {
	if (downloaded(undefined, 'downloaded', item, existing, contract)) {
		return 1;
	}

	let content_type = type(item.type, 'type', item, existing, contract);

	if (contract && contract.limits) {
		if (contract.limits[content_type] > -1) {
			if (!contract.download_count || !contract.download_count.remaining || contract.download_count.remaining[content_type] > 0) {
				return 1;
			}
			else {
				return -1;
			}
		}
	}

	return 0;
};
