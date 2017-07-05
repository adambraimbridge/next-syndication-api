'use strict';

const { EventEmitter } = require('events');
const path = require('path');
const { Writable: WritableStream } = require('stream');

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

const underTest = require('../../../server/controllers/user-status');

const httpMocks = require('../../fixtures/node-mocks-http');

const { expect } = chai;
chai.use(sinonChai);

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe(MODULE_ID, function () {
	let req;
	let res;

	beforeEach(function () {
		req = httpMocks.createRequest({
			'eventEmitter': EventEmitter,
			'connection': new EventEmitter(),
			'headers': {
				'ft-real-url': 'https://www.ft.com/syndication/user-status',
				'ft-real-path': '/syndication/user-status',
				'ft-vanity-url': '/syndication/user-status',
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
			'originalUrl': '/syndication/user-status',
			'params': {},
			'path': '/syndication/user-status',
			'protocol': 'http',
			'query': {
				'format': 'docx'
			},
			'url': '/syndication/user-status'
		});

		res = httpMocks.createResponse({
			req,
			writableStream: WritableStream
		});

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
	});

	it('return an Object of with the user\'s status', async function() {
		await underTest(req, res, () => {});

		expect(res.json).to.have.been.calledWith({
			features: {
				syndication: true,
				syndicationNew: true,
				syndicationRedux: true
			},
			licence_id: 'xyz',
			user_id: 'abc'
		});
	});

	it('set the HTTP status to 200', async function() {
		await underTest(req, res, () => {});

		expect(res.status).to.have.been.calledWith(200);
	});
});
