'use strict';

const {expect} = require('chai');

//const AJV = require('ajv');
const moment = require('moment');

const SchemaMessageV1 = require('../../schema/message-v1.json');

const underTest = require('../../queue/format-message');

//const ajv = new AJV({
//	allErrors: true,
//	coerceTypes: true,
//	format: 'full',
//	useDefaults: true,
//	verbose: true
//});

//const validate = ajv.compile(SchemaMessageV1);

describe('queue/format-message', function () {

	it('adds the `time` property if it is missing', function () {
		expect(underTest({})).to.have.property('time').and.be.a('date');
	});

	it('does not overwrite the `time` if exists', function () {
		let date = moment().subtract(2, 'days').toDate();

		expect(underTest({time: date})).to.have.property('time').and.be.a('date').and.equal(date);
	});

	it('fills missing values with the `default` values defined in the message-v1 JSONSchema', function () {
		let event = underTest({});

		for (let [key, val] of Object.entries(SchemaMessageV1.properties)) {
			if (Object.prototype.hasOwnProperty.call(val, 'default')) {
				expect(event).to.have.property(key).and.equal(val.default);
			}
		}
	});

});
