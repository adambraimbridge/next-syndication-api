'use strict';

const path = require('path');

const { expect } = require('chai');

const AJV = require('ajv');

const SchemaMessageV1 = require('../../schema/message-v1.json');

const underTest = require('../../queue/message-queue-event');

const ajv = new AJV({
	allErrors: true,
	coerceTypes: true,
	format: 'full',
	useDefaults: true,
	verbose: true
});

const validate = ajv.compile(SchemaMessageV1);

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe(MODULE_ID, function () {

	describe('new MessageQueueEvent', function () {
		it('should use the default `QueueUrl` when none is given', function () {
			let event = new underTest();

			expect(event.toSQSTransport()).to.have.property('QueueUrl').and.equal(process.env.SYNDICATION_DOWNLOAD_SQS_URL);
		});

		it('should allow you to pass a custom `QueueUrl`', function () {
			let event = new underTest({ queue_url: 'https://i.dont.exist/queue' });

			expect(event.toSQSTransport()).to.have.property('QueueUrl').and.equal('https://i.dont.exist/queue');
		});

		it('should use the default `JSONSchema` when none is given', function () {
			let event = new underTest();

			expect(event).to.have.property('__schema__').and.equal(SchemaMessageV1);
		});

		it('should allow you to pass a custom `JSONSchema`', function () {
			let SchemaMessageV2 = JSON.parse(JSON.stringify(SchemaMessageV1));
			SchemaMessageV2.title = 'MessageV2';

			let event = new underTest({
				schema: SchemaMessageV2
			});

			expect(event).to.have.property('__schema__').and.equal(SchemaMessageV2);

			expect(event.__schema__).to.have.property('title').and.equal(SchemaMessageV2.title);
		});

		it('should allow you to pass an event structure', function () {
			let event_data = {
				licence_id: 'foo',
				time: new Date(),
				user_id: 'bar'
			};

			let event = new underTest({ event: event_data });

			expect(event).to.have.property('licence_id').and.equal(event_data.licence_id);
			expect(event).to.have.property('time').and.equal(event_data.time.toJSON());
			expect(event).to.have.property('user_id').and.equal(event_data.user_id);
		});
	});

	it('#toString', function () {
		let event = new underTest();

		expect(event.toString()).to.equal('[object MessageQueueEvent]');
		expect(Object.prototype.toString.call(event)).to.equal('[object MessageQueueEvent]');
	});

	it('#id', function () {
		let event = new underTest();

		expect(event).to.have.property('id').and.equal(event._id);
	});

	it('#_id', function () {
		let event = new underTest();

		expect(event).to.have.property('_id').and.equal(event.id);
	});

	it('#clone', function () {
		let event_data = {
			content_id: 'abc',
			content_uri: 'https://ft.com/content/abc',
			download_format: 'docx',
			licence_id: 'foo',
			state: 'save',
			time: new Date(),
			user_id: 'bar'
		};

		let event = new underTest({
			event: event_data,
			queue_url: 'https://i.dont.exist/queue'
		});

		let event_clone = event.clone();

		expect(event).to.not.equal(event_clone);
		expect(event.toSQSTransport()).to.eql(event_clone.toSQSTransport());
	});

	it('#stringify', function () {
		let event_data = {
			licence_id: 'foo',
			time: new Date(),
			user_id: 'bar'
		};

		let event = new underTest({ event: event_data });

		expect(event.stringify()).to.equal(JSON.stringify(event));
	});

	it('#toJSON', function () {
		let event_data = {
			content_id: 'abc',
			content_uri: 'https://ft.com/content/abc',
			download_format: 'docx',
			licence_id: 'foo',
			state: 'save',
			time: new Date(),
			user_id: 'bar'
		};

		let event = new underTest({ event: event_data });
		let event_json = event.toJSON();

		expect(validate(event_json)).to.be.true;

		for (let [key, val] of Object.entries(event_data)) {
			expect(event_json).to.have.property(key).and.equal(typeof val.toJSON === 'function' ? val.toJSON() : val);
		}
	});

	it('#toSQSTransport', function () {
		let event_data = {
			content_id: 'abc',
			content_uri: 'https://ft.com/content/abc',
			download_format: 'docx',
			licence_id: 'foo',
			state: 'save',
			time: new Date(),
			user_id: 'bar'
		};

		let event = new underTest({ event: event_data });

		expect(event.toSQSTransport()).to.eql({
			MessageBody: event.stringify(),
			QueueUrl: process.env.SYNDICATION_DOWNLOAD_SQS_URL
		});
	});

	describe('#validate', function () {
		it('fail', function () {
			let event_data = {
			};

			let event = new underTest({ event: event_data });

			expect(event.validate()).to.be.false;
		});

		it('pass', function () {
			let event_data = {
				content_id: 'abc',
				content_uri: 'https://ft.com/content/abc',
				download_format: 'docx',
				licence_id: 'foo',
				state: 'save',
				time: new Date(),
				user_id: 'bar'
			};

			let event = new underTest({ event: event_data });

			expect(event.validate()).to.be.true;
		});
	});
});