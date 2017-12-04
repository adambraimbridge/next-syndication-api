'use strict';

const path = require('path');

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const proxyquire = require('proxyquire');

const MessageQueueEvent = require('../../../../queue/message-queue-event');
const messageCode = require('../../../../server/lib/resolve/messageCode');

const {
	TRACKING,
	TEST: { FIXTURES_DIRECTORY }
} = require('config');

const { expect } = chai;
chai.use(sinonChai);

const PACKAGE = require(path.resolve('./package.json'));
const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe(MODULE_ID, function () {
	const contractResponse = require(path.resolve(`${FIXTURES_DIRECTORY}/contractResponse.json`));

	let underTest;
	let db;
	let fetchStub;
	let fetchJSONStub;
	let subscriber;

	const { initDB } = require(path.resolve(`${FIXTURES_DIRECTORY}/massive`))();

	afterEach(function () {
	});

	beforeEach(function () {
		db = initDB();

		db.syndication.get_contract_data.resolves([contractResponse]);

		fetchJSONStub = sinon.stub();
		fetchStub = sinon.stub().resolves({
			ok: true,
			json: fetchJSONStub.resolves({ status: 'Feed me now!' })
		});

		underTest = proxyquire('../../../../worker/sync/db-persist/spoor-publish', {
			'n-eager-fetch': fetchStub,
			'../../../db/pg': sinon.stub().resolves(db)
		});
	});

	it('publishes a message queue event to spoor', async function () {
		const event = (new MessageQueueEvent({
			event: {
				canDownload: 1,
				content_id: 'http://www.ft.com/thing/abc',
				contract_id: 'syndication',
				download_format: 'docx',
				iso_lang_code: 'en',
				licence_id: 'foo',
				state: 'saved',
				time: new Date(),
				tracking: {
					cookie: 'cookie',
					ip_address: '127.0.0.1',
					referrer: '/republishing/download',
					session: 'session',
					spoor_id: 'spoor-id',
					url: '/republishing/download',
					user_agent: 'user-agent'
				},
				user: {
					email: 'foo@bar.com',
					first_name: 'foo',
					id: 'bar',
					passport_id: '1234567890',
					lastName: 'bar'
				}
			}
		})).toJSON();

		const message = { data: event };

		const data = JSON.parse(JSON.stringify(TRACKING.DATA));

		data.action = 'save-for-later-downloads-page';

		data.context.id = event._id;
		data.context.article_id = event.content_id.split('/').pop();
		data.context.contractID = event.contract_id;
		data.context.appVersion = PACKAGE.version;
		data.context.languageVersion = 'en';
		data.context.message = messageCode({
			canDownload: 1,
			canBeSyndicated: 'yes',
			downloaded: false
		}, contractResponse);
		data.context.referrer = event.tracking.referrer;
		data.context.route_id = event._id;
		data.context.url = event.tracking.url;


		if (event.download_format) {
			data.context.fileformat = event.download_format;
		}

		data.context.syndication_content = event.content_type;

		data.device.ip = event.tracking.ip_address;
		data.device.spoor_id = event.tracking.spoor_id;
		data.device.spoor_session = event._id;

		data.system.source = PACKAGE.name;
		data.system.version = PACKAGE.version;

		data.user = {
			ft_session: event.tracking.session,
			passport_id: event.user.passport_id
		};

		const NODE_ENV = process.env.NODE_ENV;

		process.env.NODE_ENV = 'production';

		await underTest(event, message, {}, subscriber);

		expect(fetchStub).to.be.calledWith(TRACKING.URI, {
			body: JSON.stringify(data),
			headers: Object.assign({
				'content-Length': new Buffer(JSON.stringify(data)).length,
				'cookie': event.tracking.cookie,
				'spoor-id': event.tracking.spoor_id,
				'spoor-ticket': event._id,
				'user-agent': event.tracking.user_agent
			}, TRACKING.HEADERS),
			method: TRACKING.METHOD
		});

		process.env.NODE_ENV = NODE_ENV;
	});
});
