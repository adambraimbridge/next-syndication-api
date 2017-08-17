'use strict';

const jsonpath = require('jsonpath');

const RE_COMPLEX_PATH = /[^A-Za-z0-9_-]/g;

module.exports = exports = function mapColumns (item, mapping, parent) {
	if (Array.isArray(mapping.items)) {
		mapping.items.forEach(mapping => {
			if (typeof mapping.condition === 'function') {
				if (mapping.condition(item) !== true) {
					return;
				}
			}

			let val;

			if (mapping.cite) {
				if (parent && mapping.cite.startsWith('../')) {
					val = jsonpath.value(parent, mapping.cite.substring(3));
				}
				else {
					if (Array.isArray(mapping.items)) {
						val = jsonpath.value(item, mapping.cite);

						if (!Array.isArray(val)) {
							val = [val];
						}

						val = val.map(v => mapColumns(v, mapping, item));
					}
					else {
						val = jsonpath.value(item, mapping.cite);
					}

					if (mapping.delete !== false && !RE_COMPLEX_PATH.test(mapping.cite) && mapping.cite !== mapping.id) {
						delete item[mapping.cite];
					}
				}
			}

			if (typeof mapping.transform === 'function') {
				val = mapping.transform(val);
			}

			if (typeof val !== 'undefined') {
				item[mapping.id] = val;
			}
		});
	}

	return item;
};
