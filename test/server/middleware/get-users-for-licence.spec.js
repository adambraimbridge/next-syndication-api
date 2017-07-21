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
				headers: {
					cookie: 'FTSession=123'
				}
			},
			res: {
				locals: {
					ACCESS_TOKEN_LICENCE: 'abc.123.xyz',
					licence: {
						id: 'xyz'
					},
					syndication_contract: {
						id: 'lmno'
					},
					userUuid: 'abc'
				},
				sendStatus: sandbox.stub()
			}
		};
		stubs = {
//			fetch: sandbox.stub().returns({
//				url: `${BASE_URI_FT_API}/authorize#access_token=abc.123.xyz&scope=profile_min`
//			}),
			logger: {
				default: {
					debug: sandbox.stub(),
					error: sandbox.stub(),
					fatal: sandbox.stub(),
					info: sandbox.stub(),
					warn: sandbox.stub()
				}
			},
			next: sandbox.stub()
		};

		underTest = proxyquire('../../../server/middleware/get-users-for-licence', {
			'@financial-times/n-logger': stubs.logger/*,
			'n-eager-fetch': stubs.fetch*/
		});
	});

	afterEach(function () {
		sandbox.restore();
	});

	it('should assign the returned users to `res.locals.licence.users:Array`', async function () {
		nock(BASE_URI_FT_API)
			.get(`/licence-seat-holders/${mocks.res.locals.licence.id}`)
			.reply(() => {
				return [
					200,
					require(path.resolve(`${FIXTURES_DIRECTORY}/licenceUsers.json`)),
					{}
				];
			});


		await underTest(mocks.req, mocks.res, stubs.next);

		const { users } = mocks.res.locals.licence;

		expect(users).to.be.an('array')
			.and.have.length(1);
	});

	it('should assign the returned users to `res.locals.licence.usersMap:Object`', async function () {
		nock(BASE_URI_FT_API)
			.get(`/licence-seat-holders/${mocks.res.locals.licence.id}`)
			.reply(() => {
				return [
					200,
					require(path.resolve(`${FIXTURES_DIRECTORY}/licenceUsers.json`)),
					{}
				];
			});


		await underTest(mocks.req, mocks.res, stubs.next);

		const { usersMap } = mocks.res.locals.licence;

		expect(usersMap).to.be.an('object')
			.and.have.property('8ef593a8-eef6-448c-8560-9ca8cdca80a5')
			.and.to.be.an('object');
	});

});
