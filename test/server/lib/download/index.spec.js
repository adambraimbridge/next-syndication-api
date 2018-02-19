'use strict';

const { EventEmitter } = require('events');
const path = require('path');
const { Writable: WritableStream } = require('stream');

const { expect } = require('chai');
const sinon = require('sinon');

const {
	TEST: { FIXTURES_DIRECTORY }
} = require('config');

const MessageQueueEvent = require('../../../../queue/message-queue-event');
const enrich = require('../../../../server/lib/enrich');
const underTest = require('../../../../server/lib/download');

const httpMocks = require(path.resolve(`${FIXTURES_DIRECTORY}/node-mocks-http`));

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe(MODULE_ID, function () {
	const DEFAULT_FORMAT = 'docx';
	const CONTRACT = require(path.resolve(`${FIXTURES_DIRECTORY}/contractResponse.json`));
	const LICENCE = { id: 'xyz' };
	const USER = require(path.resolve(`${FIXTURES_DIRECTORY}/userResponse.json`));

	before(function() {
		sinon.stub(MessageQueueEvent.prototype, 'publish').resolves(true);
	});

	after(function() {
		MessageQueueEvent.prototype.publish.restore();
	});

	[
		'42ad255a-99f9-11e7-b83c-9588e51488a0',
		'b16fce7e-3c92-48a3-ace0-d1af3fce71af',
		'98b46b5f-17d3-40c2-8eaa-082df70c5f01'
	].forEach(CONTENT_ID => {
		const content = enrich(require(path.resolve(`${FIXTURES_DIRECTORY}/content/${CONTENT_ID}.json`)), DEFAULT_FORMAT);

		const className = `${content.type.charAt(0).toUpperCase()}${content.type.substring(1)}Download`;
		let req;
		let res;

		describe(`${className}`, function() {
			before(function () {
				req = httpMocks.createRequest({
					'eventEmitter': EventEmitter,
					'connection': new EventEmitter(),
					'headers': {
						'ft-real-url': `https://www.ft.com/syndication/download/${CONTENT_ID}?format=docx`,
						'ft-real-path': `/syndication/download/${CONTENT_ID}?format=docx`,
						'ft-vanity-url': `/syndication/download/${CONTENT_ID}?format=docx`,
						'ft-flags-next-flags': '',
						'ft-flags': '-',
						'cookie': 'FTSession;spoor-id',
						'accept-language': 'en-GB,en-US;q=0.8,en;q=0.6',
						'accept-encoding': 'gzip, deflate, sdch, br',
						'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
						'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
					},
					'cookies': {
						'FTSession': 'FTSession',
						'spoor-id': 'spoor-id'
					},
					'hostname': 'localhost',
					'method': 'GET',
					'originalUrl': `/syndication/download/${CONTENT_ID}?format=docx`,
					'params': {},
					'path': '/syndication/download',
					'protocol': 'http',
					'query': {
						'format': 'docx'
					},
					'url': `/syndication/download/${CONTENT_ID}?format=docx`
				});

				res = httpMocks.createResponse({
					req,
					writableStream: WritableStream
				});

				res.locals = {
					contract: CONTRACT,
					licence: LICENCE,
					syndication_contract: {
						id: 'lmno'
					},
					user: USER,
					userUuid: 'abc'
				};
			});

			after(function () {
			});

			it(`returns and instance of a ${className} class`, function() {
				const dl = underTest({
					content,
					contract: CONTRACT,
					licence: LICENCE,
					req,
					user: USER
				});

				expect(dl.toString()).to.equal(`[object ${className}]`);
			});

			it('creates a "started" event', function() {
				const dl = underTest({
					content,
					contract: CONTRACT,
					licence: LICENCE,
					req,
					user: USER
				});

				expect(dl.event).to.be.an.instanceOf(MessageQueueEvent)
					.and.to.have.property('state')
					.and.to.equal('started');
			});
		});
	});

	it('throws a TypeError if the content.type is not supported', function() {
		expect(() => underTest({
			content: { content_type: 'foobar' },
		})).to.throw(TypeError);
	});
});
