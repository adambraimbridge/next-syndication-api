'use strict';

const { EventEmitter } = require('events');
const path = require('path');
const { Writable: WritableStream } = require('stream');

const chai = require('chai');
const nock = require('nock');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

const {
	BASE_URI_FT_API,
	SESSION_PRODUCTS_PATH,
	SESSION_URI,
	TEST: { FIXTURES_DIRECTORY }
} = require('config');

const MessageQueueEvent = require('../../../queue/message-queue-event');
const underTest = require('../../../server/controllers/save-by-content-id');

const httpMocks = require(path.resolve(`${FIXTURES_DIRECTORY}/node-mocks-http`));

const { expect } = chai;
chai.use(sinonChai);

const RE_VALID_URI = /^\/content\/([A-Za-z0-9]{8}(?:-[A-Za-z0-9]{4}){3}-[A-Za-z0-9]{12})$/;

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe(MODULE_ID, function () {
	const CONTENT_ID = 'b59dff10-3f7e-11e7-9d56-25f963e998b2';
	let req;
	let res;
	let stub;

	require(path.resolve(`${FIXTURES_DIRECTORY}/massive`))();

	before(function () {
		nock(SESSION_URI)
			.get(SESSION_PRODUCTS_PATH)
			.reply(200, { uuid: 'abc', products: 'Tools,S1,P0,P1,P2' }, {});

		nock(BASE_URI_FT_API)
			.get(uri => RE_VALID_URI.test(uri))
			.reply(uri => {
				return [
					200,
					require(path.resolve(`${FIXTURES_DIRECTORY}/${uri.match(RE_VALID_URI)[1]}`)),
					{}
				];
			});

		req = httpMocks.createRequest({
			'eventEmitter': EventEmitter,
			'connection': new EventEmitter(),
			'headers': {
				'ft-real-url': `https://www.ft.com/syndication/download/${CONTENT_ID}?format%3Ddocx`,
				'ft-real-path': `/syndication/download/${CONTENT_ID}?format%3Ddocx`,
				'ft-vanity-url': `/syndication/download/${CONTENT_ID}?format%3Ddocx`,
				'ft-flags-next-flags': '',
				'ft-flags': '-',
				'cookie': '',
				'accept-language': 'en-GB,en-US;q=0.8,en;q=0.6',
				'accept-encoding': 'gzip, deflate, sdch, br',
				'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
				'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
			},
			'hostname': 'localhost',
			'method': 'GET',
			'originalUrl': `/syndication/download/${CONTENT_ID}?format%3Ddocx`,
			'params': {
				'content_id': CONTENT_ID
			},
			'path': `/syndication/download/${CONTENT_ID}`,
			'protocol': 'http',
			'query': {
				'format': 'docx'
			},
			'url': `/syndication/download/${CONTENT_ID}?format%3Ddocx`
		});

		res = httpMocks.createResponse({
			req,
			writableStream: WritableStream
		});

		res.sendStatus = sinon.stub();

		res.locals = {
			licence: { id: 'xyz' },
			syndication_contract: {
				id: 'lmno'
			},
			user: {
				email: 'foo@bar.com',
				first_name: 'foo',
				user_id: 'abc',
				surname: 'bar'
			},
			userUuid: 'abc'
		};

		stub = sinon.stub(MessageQueueEvent.prototype, 'publish').callsFake(() => {});
	});

	after(function() {
		stub.restore();
	});

	describe('test', function() {
		it('should publish a save event', async function() {
			await underTest(req, res, () => {});

			expect(res.locals.__event).to.have.property('state').and.to.equal('saved');
			expect(res.locals.__event).to.have.property('user').and.to.eql({
				email: res.locals.user.email,
				first_name: res.locals.user.first_name,
				id: res.locals.user.user_id,
				surname: res.locals.user.surname
			});
			expect(res.locals.__event).to.have.property('licence_id').and.to.equal(res.locals.licence.id);
			expect(res.locals.__event).to.have.property('time').and.to.be.a('string');
			expect(res.locals.__event).to.not.have.property('download_format');
		});

		it('return 204 for a successful save', async function() {
			await underTest(req, res, () => {});

			expect(res.sendStatus).to.be.calledWith(204);
		});
	});
});
