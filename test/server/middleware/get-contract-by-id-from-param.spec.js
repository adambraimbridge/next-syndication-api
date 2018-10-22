'use strict';

const { expect } = require('chai');
const proxyquire = require('proxyquire');
const { spy } = require('sinon');

describe('Middleware: get-contract-by-id-from-param', () => {
	let req;
	let res;
	let next;
	let getContractReturnValue;
	let middleware;

	beforeEach(() => {
		req = { params: {} };
		res = { locals: {}, status: spy(() => res), send: spy() };
		next = spy();
		middleware = proxyquire(
			'../../../server/middleware/get-contract-by-id-from-param',
			{ '../lib/get-contract-by-id': () => getContractReturnValue }
		);
	});

	it('should call next with no arguments and set res.locals.contract if the contract returns successfully', done => {
		req.params.contract_id = 'FTX-11223344';
		getContractReturnValue = Promise.resolve({
			contractId: req.params.contract_id,
		});
		middleware(req, res, err => {
			expect(err).to.equal(undefined);
			expect(res.locals).to.have.property('contract');
			expect(res.locals.contract)
				.to.have.property('contractId')
				.to.equal(req.params.contract_id);
			done();
		});
	});

	it('should call next with the thrown error if getting the contract throws an error', done => {
		req.params.contract_id = 'FTX-11223344';
		getContractReturnValue = Promise.reject(new Error('Wooopsy Daisy'));
		middleware(req, res, err => {
			expect(err)
				.to.have.property('message')
				.to.equal('Wooopsy Daisy');
			expect(res.locals).to.not.have.property('contract');
			done();
		});
	});

	it('should call sendStatus 400 if there is no contract_id param', () => {
		middleware(req, res, next);
		expect(next.called).to.equal(false);
		expect(res.status.lastCall.args).to.deep.equal([400]);
		expect(res.send.lastCall.args[0])
			.to.have.property('message')
			.to.equal("Missing path parameter: 'contract_id'");
	});
});
