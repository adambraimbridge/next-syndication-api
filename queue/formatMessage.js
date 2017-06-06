'use strict';

const AJV = require('ajv');
const moment = require('moment');

const SchemaMessageV1 = require('../schema/message-v1.json');

const eventId = require('./event-id');

const ajv = new AJV({
	allErrors: true,
	coerceTypes: true,
	format: 'full',
	useDefaults: true,
	verbose: true
});

const validate = ajv.compile(SchemaMessageV1);

const formatMessage = (event) => {
	eventId(event);

	event.time = moment().toJSON();

	// for now validate only to add default values specified in schema
	validate(event);

	return event;
};

module.exports = exports = formatMessage;
