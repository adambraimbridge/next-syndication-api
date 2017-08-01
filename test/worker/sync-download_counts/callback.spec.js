'use strict';

const path = require('path');

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const proxyquire = require('proxyquire');

const MessageQueueEvent = require('../../../queue/message-queue-event');
const QueueSubscriber = require('../../../queue/subscriber');
const SchemaJobV1 = require('../../../schema/job-v1.json');

const { expect } = chai;
chai.use(sinonChai);

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe(MODULE_ID, function () {
	const contractResponse = {
		'owner_email': 'syndication@ft.com',
		'last_updated': '2017-07-19T13:37:20.291Z',
		'owner_name': 'FT Syndication',
		'contract_date': '11/12/15 - 31/01/2015',
		'contract_starts': '2015-12-11',
		'limit_podcast': 10000000,
		'contract_ends': '2050-01-31',
		'contributor_content': true,
		'limit_video': 10000000,
		'licence_id': 'f0e793d6-90d6-4581-9743-c905940602f5',
		'licencee_name': 'FT Staff',
		'content_allowed': 'Articles, Podcasts & Video',
		'assets': [{
			'online_usage_limit': 10000000,
			'product': 'FT Article',
			'online_usage_period': 'Week',
			'print_usage_period': 'Week',
			'print_usage_limit': 20,
			'embargo_period': 0,
			'asset': 'FT Article',
			'content': 'FT.com'
		}, {
			'online_usage_limit': 10000000,
			'product': 'Video',
			'online_usage_period': 'Week',
			'print_usage_period': 'Week',
			'print_usage_limit': 20,
			'embargo_period': 0,
			'asset': 'Video',
			'content': 'FT.com'
		}, {
			'online_usage_limit': 10000000,
			'product': 'Podcast',
			'online_usage_period': 'Week',
			'print_usage_period': 'Week',
			'print_usage_limit': 20,
			'embargo_period': 0,
			'asset': 'Podcast',
			'content': 'FT.com'
		}],
		'contract_number': 'CA-00001558',
		'client_website': 'https://www.ft.com',
		'client_publications': 'FT',
		'limit_article': 10000000
	};

	const downloadHistory = [{
		'syndication_state': 'yes',
		'item_state': 'complete',
		'content_id': 'http://www.ft.com/thing/6326f528-75db-11e7-a3e8-60495fe6ca71',
		'contract_id': 'FTS-14029674',
		'licence_id': 'f0e793d6-90d6-4581-9743-c905940602f5',
		'download_format': 'docx',
		'title': 'Shape the contours of Brexit Britain’s final destination',
		'version': 'v1',
		'contributor_content': false,
		'_id': '1643097dede85a81e5e94cd6168a0a06',
		'time': '2017-08-01T12:37:26.910Z',
		'published_date': '2017-08-01T04:02:08.000Z',
		'user': {
			'id': '8ef593a8-eef6-448c-8560-9ca8cdca80a5',
			'first_name': 'christos',
			'email': 'christos.constandinou@ft.com',
			'surname': 'constandinou'
		},
		'id': '6326f528-75db-11e7-a3e8-60495fe6ca71',
		'date': '01 August 2017',
		'published': '01 August 2017',
		'aggregate': {
			'year': '2017',
			'month': 7,
			'week': 30,
			'day': 212
		}
	}, {
		'syndication_state': 'yes',
		'item_state': 'complete',
		'content_id': 'http://www.ft.com/thing/6326f528-75db-11e7-a3e8-60495fe6ca71',
		'contract_id': 'FTS-14029674',
		'licence_id': 'f0e793d6-90d6-4581-9743-c905940602f5',
		'download_format': 'docx',
		'title': 'Shape the contours of Brexit Britain’s final destination',
		'version': 'v1',
		'contributor_content': false,
		'_id': 'd7cf17839495d7176ae7b986e6ce3eff',
		'time': '2017-08-01T12:37:25.194Z',
		'published_date': '2017-08-01T04:02:08.000Z',
		'user': {
			'id': '8ef593a8-eef6-448c-8560-9ca8cdca80a5',
			'first_name': 'christos',
			'email': 'christos.constandinou@ft.com',
			'surname': 'constandinou'
		},
		'id': '6326f528-75db-11e7-a3e8-60495fe6ca71',
		'date': '01 August 2017',
		'published': '01 August 2017',
		'aggregate': {
			'year': '2017',
			'month': 7,
			'week': 30,
			'day': 212
		}
	}, {
		'syndication_state': 'yes',
		'item_state': 'complete',
		'content_id': 'http://www.ft.com/thing/9fdf35a4-7610-11e7-a3e8-60495fe6ca71',
		'contract_id': 'FTS-14029674',
		'licence_id': 'f0e793d6-90d6-4581-9743-c905940602f5',
		'download_format': 'docx',
		'title': 'Brexit set to raise UK banks’ costs 4% and capital needs 30%',
		'version': 'v1',
		'contributor_content': false,
		'_id': '108ff39fefbaff6a7f889287e1e7f0ff',
		'time': '2017-08-01T12:37:21.533Z',
		'published_date': '2017-07-31T23:02:12.000Z',
		'user': {
			'id': '8ef593a8-eef6-448c-8560-9ca8cdca80a5',
			'first_name': 'christos',
			'email': 'christos.constandinou@ft.com',
			'surname': 'constandinou'
		},
		'id': '9fdf35a4-7610-11e7-a3e8-60495fe6ca71',
		'date': '01 August 2017',
		'published': '01 August 2017',
		'aggregate': {
			'year': '2017',
			'month': 7,
			'week': 30,
			'day': 212
		}
	}];

	let underTest;
	let getContractByID;
	let getHistoryByLicenceID;
	let persist;
	let subscriber;

	afterEach(function () {
		QueueSubscriber.prototype.ack.restore();
	});

	beforeEach(function () {
		getContractByID = sinon.stub().resolves(contractResponse);
		getHistoryByLicenceID = sinon.stub().resolves(downloadHistory);
		persist = sinon.stub();

		underTest = proxyquire('../../../worker/sync-download_counts/callback', {
			'../../server/lib/get-contract-by-id': getContractByID,
			'../../server/lib/get-history-by-licence-id': getHistoryByLicenceID,
			'../persist': persist
		});

		sinon.stub(QueueSubscriber.prototype, 'ack').resolves({});

		subscriber = new QueueSubscriber({});
	});

	it('calls getContractByID with the event.contract_id', async function () {
		const event = (new MessageQueueEvent({
			event: {
				contract_id: 'CA-00001558',
				licence_id: 'f0e793d6-90d6-4581-9743-c905940602f5',
				type: 'sync.download_counts'
			},
			schema: SchemaJobV1
		})).toJSON();

		const message = { data: event };

		await underTest(event, message, {}, subscriber);

		expect(getContractByID).to.be.calledWith(event.contract_id);
	});

	it('calls getHistoryByLicenceID with the correct parameters', async function () {
		const event = (new MessageQueueEvent({
			event: {
				contract_id: 'CA-00001558',
				licence_id: 'f0e793d6-90d6-4581-9743-c905940602f5',
				type: 'sync.download_counts'
			},
			schema: SchemaJobV1
		})).toJSON();

		const message = { data: event };

		await underTest(event, message, {}, subscriber);

		expect(getHistoryByLicenceID).to.be.calledWith({
			licence_id: event.licence_id,
			prep_aggregation: true,
			type: 'downloads'
		});
	});

	it('updates the contract with the aggregated download information', async function () {
		const event = (new MessageQueueEvent({
			event: {
				contract_id: 'CA-00001558',
				licence_id: 'f0e793d6-90d6-4581-9743-c905940602f5',
				type: 'sync.download_counts'
			},
			schema: SchemaJobV1
		})).toJSON();

		const message = { data: event };

		await underTest(event, message, {}, subscriber);

		expect(contractResponse)
			.to.have.property('download_count')
			.and.to.be.an('object');

		expect(contractResponse.download_count)
			.to.have.property('total')
			.and.to.equal(2);

		expect(contractResponse.download_count)
			.to.have.property('legacy')
			.and.to.equal(0);

		expect(contractResponse.download_count)
			.to.have.property('current')
			.and.to.be.an('object');

		expect(contractResponse.download_count)
			.to.have.property('archive')
			.and.to.be.an('array');

		expect(contractResponse.download_count.archive[0]).to.eql({
			'year': '2017',
			'breakdown': {
				'days': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				'months': [0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0],
				'weeks': [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
				'year': 2
			}
		});
	});

	it('persists the updated contract to the db', async function () {
		const event = (new MessageQueueEvent({
			event: {
				contract_id: 'CA-00001558',
				licence_id: 'f0e793d6-90d6-4581-9743-c905940602f5',
				type: 'sync.download_counts'
			},
			schema: SchemaJobV1
		})).toJSON();

		const message = { data: event };

		await underTest(event, message, {}, subscriber);

		expect(persist).to.be.calledWith(contractResponse);
	});

	it('removes it from the queue', async function () {
		const event = (new MessageQueueEvent({
			event: {
				contract_id: 'CA-00001558',
				licence_id: 'f0e793d6-90d6-4581-9743-c905940602f5',
				type: 'sync.download_counts'
			},
			schema: SchemaJobV1
		})).toJSON();

		const message = { data: event };

		await underTest(event, message, {}, subscriber);

		expect(QueueSubscriber.prototype.ack).to.be.calledWith(message);
	});
});
