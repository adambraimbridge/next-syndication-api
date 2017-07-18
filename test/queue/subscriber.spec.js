'use strict';

const path = require('path');

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

const AWS = require('aws-sdk');

const { SYNDICATION_DOWNLOAD_SQS_URL: DEFAULT_QUEUE_URL } = require('config');

const sleep = require('../../server/helpers/sleep');

const underTest = require('../../queue/subscriber');

const { expect } = chai;

chai.use(sinonChai);

const __proto__ = Object.getPrototypeOf(new AWS.SQS({}));

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe(MODULE_ID, function () {
	let stub;

	afterEach(function () {
		if (stub) {
			stub.restore();

			stub = null;
		}
	});

	describe('new QueueSubscriber', function () {
		it('default params', async function () {
			const item = new underTest({});

			expect(item)
				.to.have.property('queue_url')
				.and.to.equal(DEFAULT_QUEUE_URL);

			expect(item)
				.to.have.property('callbacks')
				.and.to.be.an.instanceOf(Set)
				.and.to.have.property('size')
				.and.to.equal(0);
		});

		it('custom queue_url', async function () {
			const QueueUrl = 'blah';
			const item = new underTest({ queue_url: QueueUrl });

			expect(item)
				.to.have.property('queue_url')
				.and.to.equal(QueueUrl);
		});

		it('onmessage callback', async function () {
			const cb = () => {};
			const item = new underTest({ callback: cb });

			expect(item)
				.to.have.property('callbacks')
				.and.to.be.an.instanceOf(Set)
				.and.to.have.property('size')
				.and.to.equal(1);

			expect(item.callbacks.has(cb)).to.be.true;
		});
	});

	it('#ack', async function () {
		stub = sinon.stub(__proto__, 'deleteMessageAsync').callsFake(params => params);
		const item = new underTest({});

		await item.ack({ ReceiptHandle: 'abc123' });

		expect(stub).to.be.calledWith({
			QueueUrl: item.queue_url,
			ReceiptHandle: 'abc123'
		});
	});

	it('#addCallback', async function () {
		const cb = () => {};
		const item = new underTest({});

		item.addCallback(cb);

		expect(item)
			.to.have.property('callbacks')
			.and.to.have.property('size')
			.and.to.equal(1);

		expect(item.callbacks.has(cb)).to.be.true;
	});

	describe('#fire', function () {
		it('calls callbacks', async function () {
			const cb = sinon.stub();
			const cbAsync = sinon.stub().resolves({});
			const item = new underTest({ callback: cb });

			item.addCallback(cbAsync);

			await item.fire({ Messages: [{
				Body: '{ "foo": "bar" }',
				data: { foo: 'bar' }
			}, {
				Body: '{ "bam": "bam" }',
				data: { bam: 'bam' }
			}]});

			expect(cb).to.have.callCount(2);
			expect(cbAsync).to.have.callCount(2);
		});

		it('fires message events', async function () {
			const cbListener = sinon.stub();
			const item = new underTest({});

			item.on('message', cbListener);

			await item.fire({ Messages: [{
				Body: '{ "foo": "bar" }',
				data: { foo: 'bar' }
			}, {
				Body: '{ "bam": "bam" }',
				data: { bam: 'bam' }
			}]});

			expect(cbListener).to.have.callCount(2);
		});
	});

	it('#removeCallback', async function () {
		const cb = sinon.stub();
		const item = new underTest({ callback: cb });

		item.removeCallback(cb);

		expect(item)
			.to.have.property('callbacks')
			.and.to.be.an.instanceOf(Set)
			.and.to.have.property('size')
			.and.to.equal(0);
	});

	describe('#start', function() {
		it('no callback', async function () {
			const item = new underTest({});

			stub = sinon.stub(item, 'onStart').callsFake(params => params);

			item.start();

			expect(stub).to.have.been.called;

			expect(item)
				.to.have.property('running')
				.and.to.be.true;
		});

		it('with callback', async function () {
			const cb = sinon.stub();
			const item = new underTest({});

			stub = sinon.stub(item, 'onStart').callsFake(params => params);

			item.start(cb);

			expect(stub).to.have.been.called;

			expect(item)
				.to.have.property('callbacks')
				.and.to.be.an.instanceOf(Set)
				.and.to.have.property('size')
				.and.to.equal(1);

			expect(item)
				.to.have.property('running')
				.and.to.be.true;
		});
	});

	describe('#onStart', function () {
		it('parses message.Body as message.data', async function () {
			const response = { Messages: [{
				Body: '{"foo":"bar"}'
			}, {
				Body: '{"bam":"bam"}'
			}]};

			stub = sinon.stub(__proto__, 'receiveMessageAsync').resolves(response);

			const item = new underTest({});

			item.start();

			await sleep(50);

			item.stop();

			expect(stub).to.be.calledWith({
				QueueUrl: item.queue_url,
				AttributeNames: [
					'All'
				],
				MaxNumberOfMessages: 10,
				VisibilityTimeout: 0,
				WaitTimeSeconds: 20
			});

			response.Messages.forEach(message => {
				expect(message)
					.to.have.property('data')
					.and.to.be.an('object')
					.and.to.eql(JSON.parse(message.Body));
			})
		});

		it('firing messages event', async function () {
			stub = sinon.stub(__proto__, 'receiveMessageAsync').resolves({ Messages: [{
				Body: '{"foo":"bar"}'
			}, {
				Body: '{"bam":"bam"}'
			}]});

			const cbListenerMessages = sinon.stub();
			const item = new underTest({});

			item.on('messages', cbListenerMessages);

			item.start();

			await sleep(50);

			item.stop();

			expect(cbListenerMessages).to.have.callCount(1);
		});

		it('calls #fire with response', async function () {
			const response = { Messages: [{
				Body: '{"foo":"bar"}'
			}, {
				Body: '{"bam":"bam"}'
			}]};

			stub = sinon.stub(__proto__, 'receiveMessageAsync').resolves(response);

			const item = new underTest({});
			const stubFire = sinon.stub(item, 'fire');

			item.start();

			await sleep(50);

			item.stop();

			stubFire.restore();

			expect(stubFire).to.have.been.calledWith(response);
		});
	});

	it('#stop', async function () {
		const response = { Messages: [{
			Body: '{"foo":"bar"}'
		}, {
			Body: '{"bam":"bam"}'
		}]};

		stub = sinon.stub(__proto__, 'receiveMessageAsync').resolves(response);

		const item = new underTest({});
		const stubFire = sinon.stub(item, 'fire');

		item.start();

		await sleep(50);

		expect(item)
			.to.have.property('running')
			.and.to.be.true;

		item.stop();

		stubFire.restore();

		expect(item)
			.to.have.property('running')
			.and.to.be.false;
	});

	describe('#validateCallback', function () {
		it('[object Function]', async function () {
			const item = new underTest({});

			const cb = () => {};

			expect(item.validateCallback(cb)).to.equal(cb);
		});

		it('[object AsyncFunction]', async function () {
			const item = new underTest({});

			const cb = async () => {};

			expect(item.validateCallback(cb)).to.equal(cb);
		});

		it('not a function', async function () {
			const item = new underTest({});

			expect(() => item.validateCallback({})).to.throw(TypeError);
		});
	});
});
