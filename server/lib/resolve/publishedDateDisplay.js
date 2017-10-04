'use strict';

const moment = require('moment');

const {
	MESSAGES: { DATE_FORMAT }
} = require('config');

module.exports = exports = (val, prop, item) => moment(item.firstPublishedDate || item.publishedDate).format(DATE_FORMAT);
