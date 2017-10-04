'use strict';

const { EventEmitter } = require('events');
const path = require('path');
const { Writable: WritableStream } = require('stream');

const chai = require('chai');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

const {
	TEST: { FIXTURES_DIRECTORY }
} = require('config');

const httpMocks = require(path.resolve(`${FIXTURES_DIRECTORY}/node-mocks-http`));

const { expect } = chai;
chai.use(sinonChai);

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe(MODULE_ID, function () {
	const { initDB } = require(path.resolve(`${FIXTURES_DIRECTORY}/massive`))();

	const contractResponse = require(path.resolve(`${FIXTURES_DIRECTORY}/contractResponse.json`));
	let req;
	let res;
	let underTest;

	const items = [
		'42ad255a-99f9-11e7-b83c-9588e51488a0',
		'ef4c49fe-980e-11e7-b83c-9588e51488a0',
		'b16fce7e-3c92-48a3-ace0-d1af3fce71af',
		'a1af0574-eafb-41bd-aa4f-59aa2cd084c2',
		'98b46b5f-17d3-40c2-8eaa-082df70c5f01',
		'93991a3c-0436-41bb-863e-61242e09859c'
	];

	let downloadedItems = [{
		'_id': '095ffdbf50ee4041ee18ed9077216844',
		'contract_id': 'FTS-14029674',
		'asset_type': 'FT Article',
		'user_id': '8ef593a8-eef6-448c-8560-9ca8cdca80a5',
		'content_id': '42ad255a-99f9-11e7-b83c-9588e51488a0',
		'content_url': 'http://www.ft.com/content/42ad255a-99f9-11e7-b83c-9588e51488a0',
		'time': '2017-08-22T13:32:49.226Z',
		'download_format': 'docx',
		'state': 'complete',
		'user_name': 'christos constandinou',
		'user_email': 'christos.constandinou@ft.com',
		'content_type': 'article',
		'title': 'Pound leaps to highest level since Brexit vote',
		'published_date': '2017-09-15T10:38:16.000Z',
		'syndication_state': 'yes',
		'last_modified': '2017-08-22T13:32:50.177Z',
		'id': 'c7923fba-1d31-39fd-82f0-ba1822ef20d2',
		'date': '22 August 2017',
		'published': '15 September 2017'
	}, {
		'_id': '6feabf0d4eed16682bfbd6d3560a45ee',
		'contract_id': 'FTS-14029674',
		'asset_type': 'FT Article',
		'user_id': 'b2697f93-52d3-4d42-8409-bdf91b09e894',
		'content_id': 'ef4c49fe-980e-11e7-b83c-9588e51488a0',
		'content_url': 'http://www.ft.com/content/ef4c49fe-980e-11e7-b83c-9588e51488a0',
		'time': '2017-08-22T12:35:10.751Z',
		'download_format': 'plain',
		'state': 'complete',
		'user_name': 'James Wise',
		'user_email': 'james.wise@ft.com',
		'content_type': 'article',
		'title': 'Tech companies in the city: the backlash',
		'published_date': '2017-09-15T04:01:25.000Z',
		'syndication_state': 'yes',
		'last_modified': '2017-08-22T12:35:11.895Z',
		'id': 'b59dff10-3f7e-11e7-9d56-25f963e998b2',
		'date': '22 August 2017',
		'published': '15 September 2017'
	}, {
		'_id': '8d1beddb5cc7ed98a61fc28934871b35',
		'contract_id': 'FTS-14029674',
		'asset_type': 'Video',
		'user_id': 'b2697f93-52d3-4d42-8409-bdf91b09e894',
		'content_id': 'b16fce7e-3c92-48a3-ace0-d1af3fce71af',
		'content_url': 'http://www.ft.com/video/b16fce7e-3c92-48a3-ace0-d1af3fce71af',
		'time': '2017-08-22T10:54:54.997Z',
		'state': 'complete',
		'user_name': 'James Wise',
		'user_email': 'james.wise@ft.com',
		'content_type': 'video',
		'title': 'Mental health and the gig economy',
		'published_date': '2017-09-13T12:15:43.662Z',
		'syndication_state': 'yes',
		'last_modified': '2017-08-22T10:54:55.376Z',
		'id': 'c7923fba-1d31-39fd-82f0-ba1822ef20d2',
		'date': '22 August 2017',
		'published': '13 September 2017'
	}];
	let savedItems = [{
		'_id': '8d1beddb5cc7ed98a61fc28934871b35',
		'contract_id': 'FTS-14029674',
		'asset_type': 'Video',
		'user_id': 'b2697f93-52d3-4d42-8409-bdf91b09e894',
		'content_id': 'b16fce7e-3c92-48a3-ace0-d1af3fce71af',
		'content_url': 'http://www.ft.com/video/b16fce7e-3c92-48a3-ace0-d1af3fce71af',
		'time': '2017-08-22T10:54:54.997Z',
		'state': 'saved',
		'user_name': 'James Wise',
		'user_email': 'james.wise@ft.com',
		'content_type': 'video',
		'title': 'Mental health and the gig economy',
		'published_date': '2017-09-13T12:15:43.662Z',
		'syndication_state': 'yes',
		'last_modified': '2017-08-22T10:54:55.376Z',
		'id': 'c7923fba-1d31-39fd-82f0-ba1822ef20d2',
		'date': '22 August 2017',
		'published': '20 June 2017'
	}, {
		'_id': 'ee0981e4bebd818374a6c1416029656f',
		'contract_id': 'FTS-14029674',
		'asset_type': 'Video',
		'user_id': 'b2697f93-52d3-4d42-8409-bdf91b09e894',
		'content_id': 'a1af0574-eafb-41bd-aa4f-59aa2cd084c2',
		'content_url': 'http://www.ft.com/video/a1af0574-eafb-41bd-aa4f-59aa2cd084c2',
		'time': '2017-08-22T10:48:04.022Z',
		'state': 'saved',
		'user_name': 'James Wise',
		'user_email': 'james.wise@ft.com',
		'content_type': 'video',
		'title': 'Is being authentic enough to be a leader?',
		'published_date': '2017-09-13T17:10:52.586Z',
		'syndication_state': 'yes',
		'last_modified': '2017-08-22T10:48:04.301Z',
		'id': 'dbe4928a-5bec-11e7-b553-e2df1b0c3220',
		'date': '13 September 2017',
		'published': '13 September 2017'
	}];

	let allItems = downloadedItems.reduce((acc, item) => {
		acc[item.content_id] = JSON.parse(JSON.stringify(item));

		acc[item.content_id].downloaded = true;

		return acc;
	}, {});

	allItems = savedItems.reduce((acc, item) => {
		if (!(item.content_id in acc)) {
			acc[item.content_id] = JSON.parse(JSON.stringify(item));
		}

		acc[item.content_id].saved = true;

		return acc;
	}, allItems);

	beforeEach(function () {
		underTest = proxyquire('../../../server/controllers/resolve', {
			'../lib/get-all-existing-items-for-contract': sinon.stub().resolves(allItems),
			'../lib/get-content': async function()  {
				return Promise.resolve(require(path.resolve(`${FIXTURES_DIRECTORY}/content/items.json`)));
			},
			'@noCallThru': true
		});

		req = httpMocks.createRequest({
			'eventEmitter': EventEmitter,
			'connection': new EventEmitter(),
			'body': Array.from(items),
			'headers': {
				'ft-real-url': 'https://www.ft.com/syndication/resolve',
				'ft-real-path': '/syndication/resolve',
				'ft-vanity-url': '/syndication/resolve',
				'ft-flags-next-flags': '',
				'ft-flags': '-',
				'cookie': '',
				'accept-language': 'en-GB,en-US;q=0.8,en;q=0.6',
				'accept-encoding': 'gzip, deflate, sdch, br',
				'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
				'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
			},
			'hostname': 'localhost',
			'method': 'POST',
			'originalUrl': '/syndication/resolve',
			'params': {},
			'path': '/syndication/resolve',
			'protocol': 'http',
			'query': {
				'format': 'docx'
			},
			'url': '/syndication/resolve'
		});

		res = httpMocks.createResponse({
			req,
			writableStream: WritableStream
		});

		res.sendStatus = sinon.stub();
		res.json = sinon.stub();

		res.locals = {
			$DB: initDB([]),
			contract: contractResponse,
			flags: {
				syndicationDownloadMediaResource: true
			},
			licence: { id: 'xyz' },
			syndication_contract: {
				id: 'lmno'
			},
			userUuid: 'abc'
		};
	});

	afterEach(function () {
	});

	it('return a 400 if the request body is not a JSON Array', async function () {
		delete req.body;

		await underTest(req, res, () => {});

		expect(res.sendStatus).to.have.been.calledWith(400);
	});

	it('return a 400 if the request body is an empty JSON Array', async function () {
		req.body.length = 0;

		await underTest(req, res, () => {});

		expect(res.sendStatus).to.have.been.calledWith(400);
	});

	it('return an Array of distinct content items for every content ID it can find', async function () {
		await underTest(req, res, () => {});

		expect(res.json).to.have.been.calledWith([{
			canBeSyndicated: 'yes',
			canDownload: 1,
			downloaded: true,
			embargoPeriod: null,
			id: '42ad255a-99f9-11e7-b83c-9588e51488a0',
			messageCode: 'MSG_2100',
			publishedDate: '2017-09-15T10:38:16.000Z',
			publishedDateDisplay: '15th Sep 2017',
			saved: false,
			title: 'Pound leaps to highest level since Brexit vote',
			type: 'article',
			wordCount: undefined
		}, {
			canBeSyndicated: 'yes',
			canDownload: 1,
			downloaded: true,
			embargoPeriod: null,
			id: 'ef4c49fe-980e-11e7-b83c-9588e51488a0',
			messageCode: 'MSG_2100',
			publishedDate: '2017-09-15T04:01:25.000Z',
			publishedDateDisplay: '15th Sep 2017',
			saved: false,
			title: 'Tech companies in the city: the backlash',
			type: 'article',
			wordCount: undefined
		}, {
			canBeSyndicated: 'yes',
			canDownload: 1,
			downloaded: true,
			embargoPeriod: null,
			id: 'b16fce7e-3c92-48a3-ace0-d1af3fce71af',
			messageCode: 'MSG_2100',
			publishedDate: '2017-09-13T12:15:43.662Z',
			publishedDateDisplay: '13th Sep 2017',
			saved: true,
			title: 'Mental health and the gig economy',
			type: 'video',
			wordCount: undefined
		}, {
			canBeSyndicated: 'yes',
			canDownload: 1,
			downloaded: false,
			embargoPeriod: null,
			id: 'a1af0574-eafb-41bd-aa4f-59aa2cd084c2',
			messageCode: 'MSG_2000',
			publishedDate: '2017-09-13T17:10:52.586Z',
			publishedDateDisplay: '13th Sep 2017',
			saved: true,
			title: 'Is being authentic enough to be a leader?',
			type: 'video',
			wordCount: undefined
		}, {
			canBeSyndicated: undefined,
			canDownload: 1,
			downloaded: false,
			embargoPeriod: null,
			id: '98b46b5f-17d3-40c2-8eaa-082df70c5f01',
			messageCode: 'MSG_5000',
			publishedDate: '2017-09-15T04:01:00.000Z',
			publishedDateDisplay: '15th Sep 2017',
			saved: false,
			title: 'The economics of immigration',
			type: 'podcast',
			wordCount: undefined
		}, {
			canBeSyndicated: undefined,
			canDownload: 1,
			downloaded: false,
			embargoPeriod: null,
			id: '93991a3c-0436-41bb-863e-61242e09859c',
			messageCode: 'MSG_5000',
			publishedDate: '2017-09-15T04:00:00.000Z',
			publishedDateDisplay: '15th Sep 2017',
			saved: false,
			title: 'The Hits that Shook the World',
			type: 'podcast',
			wordCount: undefined
		}]);
	});
});
