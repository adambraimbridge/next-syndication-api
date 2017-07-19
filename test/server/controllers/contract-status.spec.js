'use strict';

const { EventEmitter } = require('events');
const path = require('path');
const { Writable: WritableStream } = require('stream');

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const proxyquire = require('proxyquire');

const {
	TEST: { FIXTURES_DIRECTORY }
} = require('config');

const httpMocks = require('../../fixtures/node-mocks-http');

const { expect } = chai;
chai.use(sinonChai);

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe(MODULE_ID, function () {
	describe('success', function () {
		let next;
		let req;
		let res;
		let contract = require(path.resolve(`${FIXTURES_DIRECTORY}/contractProfile.json`));

		before(async function () {
			const underTest = proxyquire('../../../server/controllers/contract-status', {
				'../lib/get-contract-by-id': sinon.stub().resolves(contract)
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
			expect(res.json).to.have.been.calledWith(contract);
		});

		it('sets the http status to 200', function () {
			expect(res.status).to.have.been.calledWith(200);
		});

		it('calls the next middleware function', function () {
			expect(next).to.have.been.called;
		});
	});
});
