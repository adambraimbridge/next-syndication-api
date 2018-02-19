'use strict';

const { EventEmitter } = require('events');
const path = require('path');
const { Writable: WritableStream } = require('stream');

const { expect } = require('chai');
const sinon = require('sinon');

const moment = require('moment');
const { mkdir, rm } = require('shelljs');

const {
	TEST: {
		FIXTURES_DIRECTORY,
		TEMP_FILES_DIRECTORY
	}
} = require('config');

const MessageQueueEvent = require('../../../../queue/message-queue-event');
const enrich = require('../../../../server/lib/enrich');
const sleep = require('../../../../server/helpers/sleep');
const underTest = require('../../../../server/lib/download/article');

const httpMocks = require(path.resolve(`${FIXTURES_DIRECTORY}/node-mocks-http`));

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

mkdir('-p', path.resolve(TEMP_FILES_DIRECTORY));

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

		rm('-rf', path.resolve(TEMP_FILES_DIRECTORY));
	});

	const CONTENT_ID = '42ad255a-99f9-11e7-b83c-9588e51488a0';

	const content = enrich(require(path.resolve(`${FIXTURES_DIRECTORY}/content/${CONTENT_ID}.json`)), DEFAULT_FORMAT);

	const className = `${content.type.charAt(0).toUpperCase()}${content.type.substring(1)}Download`;

	let event;
	let req;
	let res;

	describe(`${className}`, function() {
		beforeEach(function () {
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

			event = new MessageQueueEvent({
				event: {
					content_id: content.id,
					content_type: content.content_type,
					content_url: content.webUrl,
					contract_id: CONTRACT.contract_id,
					download_format: content.extension,
					licence_id: LICENCE.id,
					published_date: content.firstPublishedDate || content.publishedDate,
					state: 'started',
					syndication_state: String(content.canBeSyndicated),
					time: moment().toDate(),
					title: content.title,
					tracking: {
						cookie: req.headers.cookie,
						ip_address: req.ip,
						referrer: req.get('referrer'),
						session: req.cookies.FTSession,
						spoor_id: req.cookies['spoor-id'],
						url: req.originalUrl,
						user_agent: req.get('user-agent')
					},
					user: {
						email: USER.email,
						first_name: USER.first_name,
						id: USER.user_id,
						surname: USER.surname
					}
				}
			});
		});

		after(function () {
		});

		it('initialises the download and publishes the start event', async function() {
			const dl = new underTest({
				content,
				contract: CONTRACT,
				licence: LICENCE,
				event,
				req,
				user: USER
			});

			await sleep(100);

			expect(dl.event.publish).to.have.been.called;
		});

		it('#downloadAsArchive', async function() {
			const dl = new underTest({
				content,
				contract: CONTRACT,
				licence: LICENCE,
				event,
				req,
				user: USER
			});

			expect(dl.downloadAsArchive).to.be.false;
		});

		it('#convertArticle', async function() {
			const dl = new underTest({
				content,
				contract: CONTRACT,
				licence: LICENCE,
				event,
				req,
				user: USER
			});

			let file = await dl.convertArticle();

			expect(file).to.be.an.instanceOf(Buffer);
		});
	});
});
