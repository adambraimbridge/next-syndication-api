'use strict';

const path = require('path');

const chai = require('chai');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

const { expect } = chai;
chai.use(sinonChai);

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe(MODULE_ID, function () {
	let sandbox;
	let mocks;
	let stubs;
	let underTest;

	beforeEach(function () {
		underTest = proxyquire('../../../server/middleware/decode-cookie-ft-user', {
		});

		sandbox = sinon.sandbox.create();
		mocks = {
			req: {
				cookies: {
					FT_User: 'USERID=6000459599:EMAIL=christos.constandinou@ft.com:FNAME=christos:LNAME=constandinou:TIME=[Mon,+04-Sep-2017+09:29:47+GMT]:USERNAME=christos.constandinou@ft.com:REMEMBER=_REMEMBER_:ERIGHTSID=2000459599:PRODUCTS=_Tools_S1_P0_P2_:RESOURCES=:GROUPS=:X='
				}
			},
			res: {
				locals: {}
			}
		};
		stubs = {
			next: sandbox.stub()
		};
	});

	afterEach(function () {
		sandbox.restore();
	});

	it('assigns the parsed FT_User Object to res.locals.FT_User', async function () {
		await underTest(mocks.req, mocks.res, stubs.next);

		expect(mocks.res.locals).to.have.property('FT_User')
			.and.to.be.an('object')
			.and.to.eql({
				USERID: '6000459599',
				EMAIL: 'christos.constandinou@ft.com',
				FNAME: 'christos',
				LNAME: 'constandinou',
				TIME: '[Mon,+04-Sep-2017+09:29:47+GMT]',
				USERNAME: 'christos.constandinou@ft.com',
				REMEMBER: ['REMEMBER'],
				ERIGHTSID: '2000459599',
				PRODUCTS: ['Tools', 'S1', 'P0', 'P2'],
				RESOURCES: '',
				GROUPS: '',
				X: ''
			});
	});

	it('calls next', async function () {
		await underTest(mocks.req, mocks.res, stubs.next);

		expect(stubs.next).to.have.been.called;
	});
});
