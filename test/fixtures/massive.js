'use strict';

const sinon = require('sinon');

const massiveDatabase = require('massive/lib/database');

const massiveDatabase__proto__ = Object.getPrototypeOf(massiveDatabase);

module.exports = exports = function () {
	beforeEach(function () {
		massiveDatabase__proto__.constructor = sinon.stub().returns(Object.create(massiveDatabase__proto__));
		massiveDatabase__proto__.query = sinon.stub();
		massiveDatabase__proto__.run = sinon.stub();
	});

	afterEach(function () {
		massiveDatabase__proto__.constructor.release();
		massiveDatabase__proto__.query.release();
		massiveDatabase__proto__.run.release();
	});

	return massiveDatabase__proto__;
};
