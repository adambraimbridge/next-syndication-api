'use strict';

const { EventEmitter } = require('events');
const path = require('path');
const { Writable: WritableStream } = require('stream');

const chai = require('chai');
const nock = require('nock');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

const {
	TEST: { FIXTURES_DIRECTORY }
} = require('config');

const httpMocks = require('../../fixtures/node-mocks-http');

const underTest = require('../../../server/controllers/contract-status');

const { expect } = chai;
chai.use(sinonChai);

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe(MODULE_ID, function () {
	describe('success', function () {
		let next;
		let req;
		let res;

		before(async function () {
			nock('https://test.salesforce.com')
				.post('/services/oauth2/token')
				.reply(() => {
					return [
						200,
						{
							access_token: '00DL....z_pH',
							instance_url: 'https://financialtimes--test.cs8.my.salesforce.com',
							id: 'https://test.salesforce.com/id/00D...MAM/005...IAO',
							token_type: 'Bearer',
							issued_at: '1500301959088',
							signature: 'dL6R....rgA='
						}
					];
				});

			nock('https://financialtimes--test.cs8.my.salesforce.com')
				.get('/services/apexrest/SCRMContract/FTS-14046740')
				.reply(() => {
					return [
						200,
						require(path.resolve(`${FIXTURES_DIRECTORY}/contractProfile.json`)),
						{}
					];
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
				flags: {
					syndication: true,
					syndicationNew: 'on',
					syndicationRedux: 'on'
				},
				licence: { id: 'xyz' },
				userUuid: 'abc'
			};

			next = sinon.stub();

			await underTest(req, res, next);
		});

		it('returns contract data', function () {
			expect(res.json).to.have.been.calledWith(require(path.resolve(`${FIXTURES_DIRECTORY}/contractProfile.json`)));
		});

		it('sets the http status to 200', function () {
			expect(res.status).to.have.been.calledWith(200);
		});

		it('calls the next middleware function', function () {
			expect(next).to.have.been.called;
		});
	});
});
