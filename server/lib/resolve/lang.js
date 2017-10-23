'use strict';

module.exports = exports = (val, prop, item, existing) => existing ? existing.lang || existing.iso_lang_code || 'en' : 'en';
