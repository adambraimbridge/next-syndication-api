'use strict';

module.exports = exports = (val, prop, item, existing) =>
	item.lang ||
	(existing ? existing.lang || existing.iso_lang_code || 'en' : 'en');
