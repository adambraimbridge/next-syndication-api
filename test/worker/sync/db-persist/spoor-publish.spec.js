'use strict';

const path = require('path');

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const proxyquire = require('proxyquire');

const MessageQueueEvent = require('../../../../queue/message-queue-event');
const messageCode = require('../../../../server/lib/resolve/messageCode');

const {
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
					lastName: 'bar'
				}
			}
		})).toJSON();

		const message = { data: event };

		const data = {
			action: 'save-for-later-downloads-page',
			category: 'syndication',
			context: {
				app: 'Syndication',
				edition: 'uk',
				product: 'next',
				id: event._id,
				article_id: event.content_id.split('/').pop(),
				contractID: event.contract_id,
				appVersion: PACKAGE.version,
				languageVersion: 'en',
				message: messageCode({ canDownload: 1, canBeSyndicated: 'yes', downloaded: false }, contractResponse),
				referrer: event.tracking.referrer,
				route_id: event._id,
				url: event.tracking.url,
				syndication_content: event.content_type
			},
			device: {
				spoor_session_is_new: true,
				ip: event.tracking.ip_address,
				spoor_id: event.tracking.spoor_id,
				spoor_session: event._id
			},
			system: {
				api_key: 'qUb9maKfKbtpRsdp0p2J7uWxRPGJEP',
				product: 'Syndication',
				source: PACKAGE.name,
				version: PACKAGE.version
			},
			user: {
				ft_session: event.tracking.session
			}
		};

		if (event.download_format) {
			data.context.fileformat = event.download_format;
		}

		const NODE_ENV = process.env.NODE_ENV;

		process.env.NODE_ENV = 'production';

		await underTest(event, message, {}, subscriber);

		expect(fetchStub).to.be.calledWith('https://spoor-api.ft.com/ingest', {
			body: JSON.stringify(data),
			headers: {
				'content-Length': new Buffer(JSON.stringify(data)).length,
				'cookie': event.tracking.cookie,
				'spoor-id': event.tracking.spoor_id,
				'spoor-ticket': event._id,
				'user-agent': event.tracking.user_agent,
				'accept': 'application/json',
				'content-type': 'application/json'
			},
			method: 'POST'
		});

		process.env.NODE_ENV = NODE_ENV;
	});
});
