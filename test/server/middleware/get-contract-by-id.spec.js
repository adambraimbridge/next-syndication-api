'use strict';

const { EventEmitter } = require('events');
const path = require('path');
const { Writable: WritableStream } = require('stream');

const chai = require('chai');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

const httpMocks = require('../../fixtures/node-mocks-http');

const { expect } = chai;
chai.use(sinonChai);

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe(MODULE_ID, function () {
	describe('success', function () {
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
		let next;
		let req;
		let res;

		before(async function () {
			const underTest = proxyquire('../../../server/middleware/get-contract-by-id', {
				'../lib/get-contract-by-id': sinon.stub().resolves(contractResponse)
			});

			req = httpMocks.createRequest({
				'eventEmitter': EventEmitter,
				'connection': new EventEmitter(),
				'headers': {
					'ft-real-url': 'https://www.ft.com/syndication/contract-status',
					'ft-real-path': '/syndication/contract-status',
					'ft-vanity-url': '/syndication/contract-status',
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
				'originalUrl': '/syndication/contract-status',
				'params': {},
				'path': '/syndication/contract-status',
				'protocol': 'http',
				'query': {
					'format': 'docx'
				},
				'url': '/syndication/contract-status'
			});

			res = httpMocks.createResponse({
				req,
				writableStream: WritableStream
			});

			res.sendStatus = sinon.stub();
			res.status = sinon.stub();
			res.json = sinon.stub();

			res.locals = {
				contract: contractResponse,
				flags: {
					syndication: true,
					syndicationNew: 'on',
					syndicationRedux: 'on'
				},
				licence: { id: 'xyz' },
				syndication_contract: {
					id: 'lmno'
				},
				userUuid: 'abc'
			};

			next = sinon.stub();

			await underTest(req, res, next);
		});

		it('sets contract data on res.locals', function () {
			expect(res.locals.contract).to.eql(contractResponse);
		});
	});
});
