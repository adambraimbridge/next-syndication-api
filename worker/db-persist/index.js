'use strict';


const worker = require('../index');

const spoorPublish = require('./spoor-publish');
const upsertHistory = require('./upsert-history');

const event_type = 'db.persist';

module.exports = exports = worker({
	autoAck: true,
	callback: upsertHistory,
	event_type
});

exports.addCallback(spoorPublish);
