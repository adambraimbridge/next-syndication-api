'use strict';

const MessageQueueEvent = require('../../queue/message-queue-event');
const SchemaJobV1 = require('../../schema/job-v1.json');

const worker = require('../index');

const callback = require('./callback');

const type = 'db.persist';

const subscriber = worker({ callback, type });

// once we've processed all messages, we'll fire off another event to aggregate the download counts
subscriber.on('complete', async (count, response) => {
	const {
		contract_id,
		licence_id
	} = response.Messages[0].data;

	const message = new MessageQueueEvent({
		event: {
			contract_id,
			licence_id
		},
		schema: SchemaJobV1
	});

	process.nextTick(async () => await message.publish());
});
