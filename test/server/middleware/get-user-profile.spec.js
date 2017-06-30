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
					ACCESS_TOKEN: 'abc.123.xyz',
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
					info: sandbox.stub()
				}
			},
			next: sandbox.stub()
		};

		underTest = proxyquire('../../../server/middleware/get-user-profile', {
			'@financial-times/n-logger': stubs.logger/*,
			'n-eager-fetch': stubs.fetch*/
		});
	});

	afterEach(function () {
		sandbox.restore();
	});

	it('should assign the returned user profile to `res.locals.user`', async function () {
		nock(BASE_URI_FT_API)
			.get(`/users/${mocks.res.locals.userUuid}/profile`)
			.reply(() => {
				return [
					200,
					require(path.resolve(`${FIXTURES_DIRECTORY}/userProfile.json`)),
					{}
				];
			});


		await underTest(mocks.req, mocks.res, stubs.next);

		const { user } = mocks.res.locals;

		expect(user).to.be.an('object')
			.and.have.property('email')
			.and.to.be.a('string')
			.and.to.equal('christos.constandinou@ft.com');
	});

});
