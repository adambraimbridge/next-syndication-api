'use strict';

const path = require('path');

const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const nock = require('nock');
const proxyquire = require('proxyquire');

const { expect } = chai;
chai.use(sinonChai);

const {
	BASE_URI_FT_API,
	TEST: { FIXTURES_DIRECTORY }
} = require('config');

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe(MODULE_ID, function () {
	let sandbox;
	let mocks;
	let stubs;
	let underTest;

	beforeEach(function () {
		sandbox = sinon.sandbox.create();
		mocks = {
			req: {
				cookies: {
					FTSession: '123'
				},
				headers: {}
			},
			res: {
				locals: {
					userUuid: 'abc'
				},
				sendStatus: sandbox.stub()
			}
		};
		stubs = {
			logger: {
				default: {
					info: sandbox.stub()
				}
			},
			next: sandbox.stub()
		};

		underTest = proxyquire('../../../server/middleware/get-syndication-licence-for-user', {
			'@financial-times/n-logger': stubs.logger
		});
	});

	afterEach(function () {
		sandbox.restore();
	});

	it('should assign the syndication licence to `res.locals.licence`', async function () {
		nock(BASE_URI_FT_API)
			.get(`/licences?userid=${mocks.res.locals.userUuid}`)
			.reply(() => {
				return [
					200,
					require(path.resolve(`${FIXTURES_DIRECTORY}/licenceList.json`)),
					{}
				];
			});

		await underTest(mocks.req, mocks.res, stubs.next);

		const { licence } = mocks.res.locals;

		expect(licence).to.be.an('object')
			.and.have.property('products')
			.and.to.be.an('array')
			.and.to.deep.include({
				code: 'S1',
				name: 'Syndication'
			});
	});

});
