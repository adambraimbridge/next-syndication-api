'use strict';

const path = require('path');

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

const AJV = require('ajv');
const AWS = require('aws-sdk');

const { SYNDICATION_DOWNLOAD_SQS_URL: DEFAULT_QUEUE_URL } = require('config');

const SchemaMessageV1 = require('../../schema/message-v1.json');

const underTest = require('../../queue/message-queue-event');

const { expect } = chai;

chai.use(sinonChai);

const ajv = new AJV({
	allErrors: true,
	coerceTypes: true,
	format: 'full',
	useDefaults: true,
	verbose: true
});

const validate = ajv.compile(SchemaMessageV1);

const __proto__ = Object.getPrototypeOf(new AWS.SQS({}));

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe(MODULE_ID, function () {

	describe('new MessageQueueEvent', function () {
		it('should use the default `QueueUrl` when none is given', function () {
			let event = new underTest();

			expect(event.toSQSTransport()).to.have.property('QueueUrl').and.equal(DEFAULT_QUEUE_URL);
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
				contract_id: 'syndication',
				licence_id: 'foo',
				published_date: new Date(),
				time: new Date(),
				tracking: {
					cookie: 'cookie',
					ip_address: '127.0.0.1',
					referrer: '/republishing/contract',
					session: 'session',
					spoor_id: 'spoor-id',
					url: '/republishing/contract',
					user_agent: 'user-agent'
				},
				user: {
					email: 'foo@bar.com',
					first_name: 'foo',
					id: 'bar',
					surname: 'bar'
				}
			};

			let event = new underTest({ event: event_data });

			expect(event).to.have.property('contract_id').and.equal(event_data.contract_id);
			expect(event).to.have.property('licence_id').and.equal(event_data.licence_id);
			expect(event).to.have.property('published_date').and.equal(event_data.published_date.toJSON());
			expect(event).to.have.property('time').and.equal(event_data.time.toJSON());
			expect(event).to.have.property('user').and.eql(event_data.user);
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

	describe('#clone', function () {
		it('no overwrites', function () {
			let event_data = {
				content_id: 'http://www.ft.com/thing/abc',
				content_url: 'http://www.ft.com/cms/abc',
				contract_id: 'syndication',
				download_format: 'docx',
				licence_id: 'foo',
				published_date: new Date(),
				state: 'saved',
				time: new Date(),
				tracking: {
					cookie: 'cookie',
					ip_address: '127.0.0.1',
					referrer: '/republishing/contract',
					session: 'session',
					spoor_id: 'spoor-id',
					url: '/republishing/contract',
					user_agent: 'user-agent'
				},
				user: {
					email: 'foo@bar.com',
					first_name: 'foo',
					id: 'bar',
					surname: 'bar'
				}
			};

			let event = new underTest({
				event: event_data,
				queue_url: 'https://i.dont.exist/queue'
			});

			let event_clone = event.clone();

			expect(event).to.not.equal(event_clone);
			expect(event.toSQSTransport()).to.eql(event_clone.toSQSTransport());
		});

		it('with overwrites', function () {
			let event_data = {
				content_id: 'http://www.ft.com/thing/abc',
				content_url: 'http://www.ft.com/cms/abc',
				contract_id: 'syndication',
				download_format: 'docx',
				licence_id: 'foo',
				published_date: new Date(),
				state: 'saved',
				time: new Date(),
				tracking: {
					cookie: 'cookie',
					ip_address: '127.0.0.1',
					referrer: '/republishing/contract',
					session: 'session',
					spoor_id: 'spoor-id',
					url: '/republishing/contract',
					user_agent: 'user-agent'
				},
				user: {
					email: 'foo@bar.com',
					first_name: 'foo',
					id: 'bar',
					surname: 'bar'
				}
			};

			let event = new underTest({
				event: event_data,
				queue_url: 'https://i.dont.exist/queue'
			});

			let one_min_into_the_future = new Date(Date.now() + (1000 * 60 * 60));
			let event_clone = event.clone({
				state: 'complete',
				time: one_min_into_the_future
			});

			expect(event).to.not.equal(event_clone);

			expect(Object.assign(event.toJSON(), {
				state: 'complete',
				time: one_min_into_the_future.toJSON()
			})).to.eql(event_clone.toJSON());
		});
	});

	it('#publish', async function () {
		let stub = sinon.stub(__proto__, 'sendMessageAsync').callsFake(transport => transport);

		let event_data = {
			contract_id: 'syndication',
			licence_id: 'foo',
			published_date: new Date(),
			time: new Date(),
			tracking: {
				cookie: 'cookie',
				ip_address: '127.0.0.1',
				referrer: '/republishing/contract',
				session: 'session',
				spoor_id: 'spoor-id',
				url: '/republishing/contract',
				user_agent: 'user-agent'
			},
			user: {
				email: 'foo@bar.com',
				first_name: 'foo',
				id: 'bar',
				surname: 'bar'
			}
		};

		let event = new underTest({ event: event_data });

		let success = await event.publish();

		expect(success).to.be.true;

		expect(__proto__.sendMessageAsync).to.be.calledWith(event.toSQSTransport());

		stub.restore();
	});

	it('#stringify', function () {
		let event_data = {
			contract_id: 'syndication',
			licence_id: 'foo',
			published_date: new Date(),
			time: new Date(),
			tracking: {
				cookie: 'cookie',
				ip_address: '127.0.0.1',
				referrer: '/republishing/contract',
				session: 'session',
				spoor_id: 'spoor-id',
				url: '/republishing/contract',
				user_agent: 'user-agent'
			},
			user: {
				email: 'foo@bar.com',
				first_name: 'foo',
				id: 'bar',
				surname: 'bar'
			}
		};

		let event = new underTest({ event: event_data });

		expect(event.stringify()).to.equal(JSON.stringify(event));
	});

	it('#toJSON', function () {
		let event_data = {
			contract_id: 'syndication',
			content_id: 'http://www.ft.com/thing/abc',
			content_url: 'http://www.ft.com/cms/abc',
			download_format: 'docx',
			licence_id: 'foo',
			published_date: new Date(),
			state: 'saved',
			time: new Date(),
			tracking: {
				cookie: 'cookie',
				ip_address: '127.0.0.1',
				referrer: '/republishing/contract',
				session: 'session',
				spoor_id: 'spoor-id',
				url: '/republishing/contract',
				user_agent: 'user-agent'
			},
			user: {
				email: 'foo@bar.com',
				first_name: 'foo',
				id: 'bar',
				surname: 'bar'
			}
		};

		let event = new underTest({ event: event_data });
		let event_json = event.toJSON();

		expect(validate(event_json)).to.be.true;

		for (let [key, val] of Object.entries(event_data)) {
			expect(event_json).to.have.property(key).and.eql(typeof val.toJSON === 'function' ? val.toJSON() : val);
		}
	});

	it('#toSQSTransport', function () {
		let event_data = {
			contract_id: 'syndication',
			content_id: 'http://www.ft.com/thing/abc',
			content_url: 'http://www.ft.com/cms/abc',
			download_format: 'docx',
			iso_lang_code: 'en',
			licence_id: 'foo',
			published_date: new Date(),
			state: 'saved',
			time: new Date(),
			tracking: {
				cookie: 'cookie',
				ip_address: '127.0.0.1',
				referrer: '/republishing/contract',
				session: 'session',
				spoor_id: 'spoor-id',
				url: '/republishing/contract',
				user_agent: 'user-agent'
			},
			user: {
				email: 'foo@bar.com',
				first_name: 'foo',
				id: 'bar',
				surname: 'bar'
			}
		};

		let event = new underTest({ event: event_data });

		expect(event.toSQSTransport()).to.eql({
			MessageBody: event.stringify(),
			QueueUrl: DEFAULT_QUEUE_URL
		});
	});

	describe('#validate', function () {
		it('fail', function () {
			let event_data = {};

			let event = new underTest({ event: event_data });

			expect(event.validate()).to.be.false;
		});

		it('pass', function () {
			let event_data = {
				content_id: 'http://www.ft.com/thing/abc',
				content_url: 'http://www.ft.com/cms/abc',
				contract_id: 'syndication',
				download_format: 'docx',
				iso_lang_code: 'en',
				licence_id: 'foo',
				published_date: new Date(),
				state: 'saved',
				time: new Date(),
				tracking: {
					cookie: 'cookie',
					ip_address: '127.0.0.1',
					referrer: '/republishing/contract',
					session: 'session',
					spoor_id: 'spoor-id',
					url: '/republishing/contract',
					user_agent: 'user-agent'
				},
				user: {
					email: 'foo@bar.com',
					first_name: 'foo',
					id: 'bar',
					surname: 'bar'
				}
			};

			let event = new underTest({ event: event_data });

			expect(event.validate()).to.be.true;
		});
	});
});
