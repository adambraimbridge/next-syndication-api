'use strict';

const path = require('path');

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const proxyquire = require('proxyquire');

const NodeMailerJSONTransport = require('nodemailer/lib/json-transport');

const MessageQueueEvent = require('../../../../queue/message-queue-event');

const {
	CONTRIBUTOR_EMAIL,
	TEST: { FIXTURES_DIRECTORY }
} = require('config');

const { expect } = chai;
chai.use(sinonChai);

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe(MODULE_ID, function () {
	const contractResponse = require(path.resolve(`${FIXTURES_DIRECTORY}/contractResponse.json`));
	let underTest;
	let db;
	let event;
	let message;
	let subscriber;

	const { initDB } = require(path.resolve(`${FIXTURES_DIRECTORY}/massive`))();

	describe('no purchase recorded', function () {
		afterEach(function () {
		});

		beforeEach(function () {
			db = initDB();

			db.syndication.get_contract_data.resolves([contractResponse]);

			db.syndication.get_contributor_purchase.resolves([{
				_id: null,
				asset_type: null,
				content_id: null,
				contract_id: null,
				content_type: null,
				email_sent: null,
				last_modified: null,
				time: null,
				user_id: null
			}]);

			db.syndication.upsert.resolves(null);

			event = (new MessageQueueEvent({
				event: {
					content_id: 'http://www.ft.com/thing/abc',
					contract_id: 'syndication',
					download_format: 'docx',
					licence_id: 'foo',
					state: 'started',
					syndication_state: 'withContributorPayment',
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
						lastName: 'bar'
					}
				}
			})).toJSON();

			message = { data: event };

			underTest = proxyquire('../../../../worker/sync/db-persist/mail-contributor', {
				'../../../db/pg': sinon.stub().resolves(db)
			});
		});

		it('sends an email', async function () {
			const res = await underTest(event, message, {}, subscriber);

			expect(res).to.be.an('object')
				.and.to.have.property('message')
				.and.to.be.a('string');

			const email = JSON.parse(res.message);

			expect(email.subject).to.equal(CONTRIBUTOR_EMAIL.subject);

			expect(email.from.address).to.equal(CONTRIBUTOR_EMAIL.from);
			expect(email.to[0].address).to.equal(CONTRIBUTOR_EMAIL.to);
		});

		it('records the contributor content purchase to the DB', async function () {
			await underTest(event, message, {}, subscriber);

			expect(db.syndication.upsert).to.be.calledWith(['contributor_purchase', event, 'syndication']);

			expect(event.email_sent).to.be.a.instanceOf(Date);
		});
	});

	describe('purchase already recorded', function () {
		afterEach(function () {
			NodeMailerJSONTransport.prototype.send.restore();
		});

		beforeEach(function () {
			db = initDB();

			sinon.stub(NodeMailerJSONTransport.prototype, 'send');

			db.syndication.get_contract_data.resolves([contractResponse]);

			db.syndication.get_contributor_purchase.resolves([{
				_id: 'abc',
				asset_type: 'FT Article',
				content_id: 'http://www.ft.com/thing/abc',
				contract_id: 'syndication',
				content_type: 'article',
				email_sent: new Date(),
				last_modified: new Date(),
				time: new Date(),
				user_id: 'bar'
			}]);

			db.syndication.upsert.resolves(null);

			event = (new MessageQueueEvent({
				event: {
					content_id: 'http://www.ft.com/thing/abc',
					contract_id: 'syndication',
					download_format: 'docx',
					licence_id: 'foo',
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
						lastName: 'bar'
					}
				}
			})).toJSON();

			message = { data: event };

			underTest = proxyquire('../../../../worker/sync/db-persist/mail-contributor', {
				'../../../db/pg': sinon.stub().resolves(db)
			});
		});

		it('does not send an email', async function () {
			const res = await underTest(event, message, {}, subscriber);

			expect(res).to.be.undefined;

			expect(NodeMailerJSONTransport.prototype.send).to.not.have.been.called;
		});
	});
});
