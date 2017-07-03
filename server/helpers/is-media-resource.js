'use strict';

const { MEDIA_RESOURCE_TYPES } = require('config');

const RE_MEDIA_RESOURCE = new RegExp(`(${MEDIA_RESOURCE_TYPES.join('|')})$`, 'i');

module.exports = exports = content =>
	RE_MEDIA_RESOURCE.test(content.type) || Array.isArray(content.dataSource);
