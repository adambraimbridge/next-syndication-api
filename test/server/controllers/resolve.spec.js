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
		'80d634ea-fa2b-46b5-886f-1418c6445182',
		'c7923fba-1d31-39fd-82f0-ba1822ef20d2',
		'b59dff10-3f7e-11e7-9d56-25f963e998b2',
		'c7923fba-1d31-39fd-82f0-ba1822ef20d2',
		'd7bf1822-ec58-4a8e-a669-5cbcc0d6a1b2',
		'dbe4928a-5bec-11e7-b553-e2df1b0c3220'
	];

	let downloadedItems = [{
		'_id': '095ffdbf50ee4041ee18ed9077216844',
		'contract_id': 'FTS-14029674',
		'asset_type': 'FT Article',
		'user_id': '8ef593a8-eef6-448c-8560-9ca8cdca80a5',
		'content_id': 'http://www.ft.com/thing/c7923fba-1d31-39fd-82f0-ba1822ef20d2',
		'time': '2017-08-22T13:32:49.226Z',
		'download_format': 'docx',
		'state': 'complete',
		'user_name': 'christos constandinou',
		'user_email': 'christos.constandinou@ft.com',
		'content_type': 'article',
		'title': 'The significance of the Brexit sequencing U-turn',
		'published_date': '2017-06-28T10:51:47.000Z',
		'syndication_state': 'yes',
		'last_modified': '2017-08-22T13:32:50.177Z',
		'id': 'c7923fba-1d31-39fd-82f0-ba1822ef20d2',
		'date': '22 August 2017',
		'published': '28 June 2017'
	}, {
		'_id': '6feabf0d4eed16682bfbd6d3560a45ee',
		'contract_id': 'FTS-14029674',
		'asset_type': 'FT Article',
		'user_id': 'b2697f93-52d3-4d42-8409-bdf91b09e894',
		'content_id': 'http://www.ft.com/thing/b59dff10-3f7e-11e7-9d56-25f963e998b2',
		'time': '2017-08-22T12:35:10.751Z',
		'download_format': 'plain',
		'state': 'complete',
		'user_name': 'James Wise',
		'user_email': 'james.wise@ft.com',
		'content_type': 'article',
		'title': 'Google deploys AI for Go tournament in China charm offensive',
		'published_date': '2017-05-23T08:59:01.000Z',
		'syndication_state': 'yes',
		'last_modified': '2017-08-22T12:35:11.895Z',
		'id': 'b59dff10-3f7e-11e7-9d56-25f963e998b2',
		'date': '22 August 2017',
		'published': '23 May 2017'
	}, {
		'_id': '8d1beddb5cc7ed98a61fc28934871b35',
		'contract_id': 'FTS-14029674',
		'asset_type': 'FT Article',
		'user_id': 'b2697f93-52d3-4d42-8409-bdf91b09e894',
		'content_id': 'http://www.ft.com/thing/c7923fba-1d31-39fd-82f0-ba1822ef20d2',
		'time': '2017-08-22T10:54:54.997Z',
		'state': 'complete',
		'user_name': 'James Wise',
		'user_email': 'james.wise@ft.com',
		'content_type': 'article',
		'title': 'The significance of the Brexit sequencing U-turn',
		'published_date': '2017-06-20T10:16:52.000Z',
		'syndication_state': 'yes',
		'last_modified': '2017-08-22T10:54:55.376Z',
		'id': 'c7923fba-1d31-39fd-82f0-ba1822ef20d2',
		'date': '22 August 2017',
		'published': '20 June 2017'
	}];
	let savedItems = [{
		'_id': '8d1beddb5cc7ed98a61fc28934871b35',
		'contract_id': 'FTS-14029674',
		'asset_type': 'FT Article',
		'user_id': 'b2697f93-52d3-4d42-8409-bdf91b09e894',
		'content_id': 'http://www.ft.com/thing/c7923fba-1d31-39fd-82f0-ba1822ef20d2',
		'time': '2017-08-22T10:54:54.997Z',
		'state': 'saved',
		'user_name': 'James Wise',
		'user_email': 'james.wise@ft.com',
		'content_type': 'article',
		'title': 'The significance of the Brexit sequencing U-turn',
		'published_date': '2017-06-20T10:16:52.000Z',
		'syndication_state': 'yes',
		'last_modified': '2017-08-22T10:54:55.376Z',
		'id': 'c7923fba-1d31-39fd-82f0-ba1822ef20d2',
		'date': '22 August 2017',
		'published': '20 June 2017'
	}, {
		'_id': 'ee0981e4bebd818374a6c1416029656f',
		'contract_id': 'FTS-14029674',
		'asset_type': 'FT Article',
		'user_id': 'b2697f93-52d3-4d42-8409-bdf91b09e894',
		'content_id': 'http://www.ft.com/thing/dbe4928a-5bec-11e7-b553-e2df1b0c3220',
		'time': '2017-08-22T10:48:04.022Z',
		'state': 'saved',
		'user_name': 'James Wise',
		'user_email': 'james.wise@ft.com',
		'content_type': 'article',
		'title': 'Hillsborough police commander charged with manslaughter',
		'published_date': '2017-06-28T11:21:44.000Z',
		'syndication_state': 'yes',
		'last_modified': '2017-08-22T10:48:04.301Z',
		'id': 'dbe4928a-5bec-11e7-b553-e2df1b0c3220',
		'date': '22 August 2017',
		'published': '28 June 2017'
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
			'../lib/get-content': async function(items)  {
				return Promise.resolve(items.map(content_id => require(path.resolve(`${FIXTURES_DIRECTORY}/${content_id}`))));
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
			id: '80d634ea-fa2b-46b5-886f-1418c6445182',
			canDownload: 1,
			canBeSyndicated: 'yes',
			downloaded: false,
			messageCode: 'MSG_2000',
			publishedDate: '2017-06-19T12:47:54.753Z',
			saved: false,
			title: 'FT View: Brexit rethink required',
			type: 'video',
			wordCount: undefined
		}, {
			id: 'c7923fba-1d31-39fd-82f0-ba1822ef20d2',
			canDownload: 1,
			canBeSyndicated: 'yes',
			downloaded: true,
			messageCode: 'MSG_2100',
			publishedDate: '2017-06-20T10:16:52.000Z',
			saved: true,
			title: 'The significance of the Brexit sequencing U-turn',
			type: 'article',
			wordCount: 1177
		}, {
			id: 'b59dff10-3f7e-11e7-9d56-25f963e998b2',
			canDownload: 1,
			canBeSyndicated: 'yes',
			downloaded: true,
			messageCode: 'MSG_2100',
			publishedDate: '2017-05-23T08:59:01.000Z',
			saved: false,
			title: 'Google deploys AI for Go tournament in China charm offensive',
			type: 'article',
			wordCount: 493
		}, {
			id: 'd7bf1822-ec58-4a8e-a669-5cbcc0d6a1b2',
			canDownload: 1,
			canBeSyndicated: 'yes',
			downloaded: false,
			messageCode: 'MSG_2000',
			publishedDate: '2017-06-07T10:30:59.301Z',
			saved: false,
			title: 'The Future is Quantum: solution to the world’s problems',
			type: 'video',
			wordCount: 205
		}, {
			id: 'dbe4928a-5bec-11e7-b553-e2df1b0c3220',
			canDownload: 1,
			canBeSyndicated: 'yes',
			downloaded: false,
			messageCode: 'MSG_2000',
			publishedDate: '2017-06-28T11:21:44.000Z',
			saved: true,
			title: 'Hillsborough police commander charged with manslaughter',
			type: 'article',
			wordCount: 939
		} ]);
	});
});
