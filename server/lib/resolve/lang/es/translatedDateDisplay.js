'use strict';

const moment = require('moment');

const {
	MESSAGES: { DATE_FORMAT }
} = require('config');

module.exports = exports = (val, prop, item) => moment(item.translated_date).format(DATE_FORMAT);
