'use strict';


const worker = require('../../index');
const createKey = require('../../create-key');

const mailContributor = require('./mail-contributor');
const spoorPublish = require('./spoor-publish');
const upsertHistory = require('./upsert-history');

const event_type = 'db.persist';

createKey().then(() => {});

module.exports = exports = worker({
	autoAck: true,
	callback: upsertHistory,
	event_type
});

exports.addCallback(spoorPublish);
exports.addCallback(mailContributor);

// add column to DB tables for email_sent::boolean so we can make sure emails were sent
