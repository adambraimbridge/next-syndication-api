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
	TEST: { FIXTURES_DIRECTORY }
} = require('config');

const underTest = require('../../../server/controllers/resolve');

const httpMocks = require('../../fixtures/node-mocks-http');

const { expect } = chai;
chai.use(sinonChai);

const RE_VALID_URI = /^\/content\/([A-Za-z0-9]{8}(?:-[A-Za-z0-9]{4}){3}-[A-Za-z0-9]{12})$/;

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe(MODULE_ID, function () {
		const contractResponse = {
			'MY_DOWNLOAD_FORMAT': 'html',
			'owner_email': 'syndication@ft.com',
			'last_updated': '2017-07-19T13:37:20.291Z',
			'owner_name': 'FT Syndication',
			'contract_date': '11/12/15 - 31/01/2015',
			'contract_starts': '2015-12-11',
			'contract_ends': '2050-01-31',
			'contributor_content': true,
			'licencee_name': 'FT Staff',
			'content_allowed': 'Articles, Podcasts & Video',
			'download_count': {
				'remaining': {
					'article': 10000000,
					'podcast': 10000000,
					'total': 300000000,
					'video': 10000000
				}
			},
			'limits': {
				'article': 10000000,
				'podcast': 10000000,
				'total': 300000000,
				'video': 10000000
			},
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
			'client_publications': 'FT'
		};
	let req;
	let res;

	const items = [
		'80d634ea-fa2b-46b5-886f-1418c6445182',
		'2778b97a-5bc9-11e7-9bc8-8055f264aa8b',
		'b59dff10-3f7e-11e7-9d56-25f963e998b2',
		'c7923fba-1d31-39fd-82f0-ba1822ef20d2',
		'd7bf1822-ec58-4a8e-a669-5cbcc0d6a1b2',
		'dbe4928a-5bec-11e7-b553-e2df1b0c3220'
	];

	beforeEach(function () {
//		items.forEach(content_id => {
//			nock(BASE_URI_FT_API)
//				.get(`/content/${content_id}`)
//				.reply(() => {
//					return [
//						200,
//						require(path.resolve(`${FIXTURES_DIRECTORY}/${content_id}.json`)),
//						{}
//					];
//				});
//		});

		nock(BASE_URI_FT_API)
			.get(uri => RE_VALID_URI.test(uri))
			.times(items.length)
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

	afterEach(function() {
		nock.cleanAll();
	});

	it('return a 400 if the request body is not a JSON Array', async function() {
		delete req.body;

		await underTest(req, res, () => {});

		expect(res.sendStatus).to.have.been.calledWith(400);
	});

	it('return a 400 if the request body is an empty JSON Array', async function() {
		req.body.length = 0;

		await underTest(req, res, () => {});

		expect(res.sendStatus).to.have.been.calledWith(400);
	});

	it('return an Array of distinct content items for every content ID it can find', async function() {
		await underTest(req, res, () => {});

		expect(res.json).to.have.been.calledWith([ {
			id: '80d634ea-fa2b-46b5-886f-1418c6445182',
			title: 'FT View: Brexit rethink required',
			type: 'video',
			canDownload: true,
			canBeSyndicated: 'yes',
			publishedDate: '2017-06-19T12:47:54.753Z',
			downloaded: false,
			saved: false
		}, {
			id: '2778b97a-5bc9-11e7-9bc8-8055f264aa8b',
			title: 'Rivals set to challenge Google’s search advantage after EU ruling',
			type: 'article',
			canDownload: true,
			canBeSyndicated: 'yes',
			publishedDate: '2017-06-28T10:51:47.000Z',
			downloaded: false,
			saved: false
		}, {
			id: 'b59dff10-3f7e-11e7-9d56-25f963e998b2',
			title: 'Google deploys AI for Go tournament in China charm offensive',
			type: 'article',
			canDownload: true,
			canBeSyndicated: 'yes',
			publishedDate: '2017-05-23T08:59:01.000Z',
			downloaded: false,
			saved: false
		}, {
			id: 'c7923fba-1d31-39fd-82f0-ba1822ef20d2',
			title: 'The significance of the Brexit sequencing U-turn',
			type: 'article',
			canDownload: true,
			canBeSyndicated: 'verify',
			publishedDate: '2017-06-20T10:16:52.000Z',
			downloaded: false,
			saved: false
		}, {
			id: 'd7bf1822-ec58-4a8e-a669-5cbcc0d6a1b2',
			title: 'The Future is Quantum: solution to the world’s problems',
			type: 'video',
			canDownload: true,
			canBeSyndicated: 'yes',
			publishedDate: '2017-06-07T10:30:59.301Z',
			downloaded: false,
			saved: false
		}, {
			id: 'dbe4928a-5bec-11e7-b553-e2df1b0c3220',
			title: 'Hillsborough police commander charged with manslaughter',
			type: 'article',
			canDownload: true,
			canBeSyndicated: 'yes',
			publishedDate: '2017-06-28T11:21:44.000Z',
			downloaded: false,
			saved: false
		} ]);
	});
});
