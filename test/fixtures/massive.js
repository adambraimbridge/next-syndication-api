'use strict';

const proxyquire = require('proxyquire').noPreserveCache();
const sinon = require('sinon');

const pg = require('../../db/pg');

pg().then(() => {});

module.exports = exports = function () {
	const massiveDatabase = proxyquire('massive/lib/database', {
		'pg-promise': sinon.stub().returns(sinon.stub().returns({
			query: sinon.stub(),
			$config: { promise: Promise }
		})),
		'@noCallThru': true
	});

	const massiveDatabase__proto__ = massiveDatabase.prototype;

	function initDB(runResolves) {
		let db = Object.create(massiveDatabase__proto__);
//		massiveDatabase__proto__.constructor.call(db);

		db.run = sinon.stub().resolves(runResolves);

		return db;
	}

	beforeEach(function () {
		sinon.stub(massiveDatabase__proto__, 'constructor').returns(initDB());
		sinon.stub(massiveDatabase__proto__, 'query');
		sinon.stub(massiveDatabase__proto__, 'run');
	});

	afterEach(function () {
		massiveDatabase__proto__.constructor.restore();
		massiveDatabase__proto__.query.restore();
	});

	return { initDB, massiveDatabase__proto__ };
};
