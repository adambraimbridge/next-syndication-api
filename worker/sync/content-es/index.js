'use strict';

const worker = require('../../index');

const upsertContent = require('./upsert-content');

const { SYNDICATION_TRANSLATION_SQS_URL } = require('config');

module.exports = exports = worker({
	autoAck: false,
	callback: upsertContent,
	queue_url: SYNDICATION_TRANSLATION_SQS_URL
});
