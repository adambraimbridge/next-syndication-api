'use strict';

module.exports = exports = (ms = 250) => {
	return new Promise(resolve => {
		let tid = setTimeout(() => {
			resolve({ ms, tid });

			clearTimeout(tid);

			tid = null;
		}, ms);
	});
};
