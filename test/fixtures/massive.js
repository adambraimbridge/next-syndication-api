'use strict';

const proxyquire = require('proxyquire').noPreserveCache();
const sinon = require('sinon');

const pg = require('../../db/pg');

pg().then(() => {});

module.exports = exports = function() {
	const massiveDatabase = proxyquire('massive/lib/database', {
		'pg-promise': sinon.stub().returns(
			sinon.stub().returns({
				query: sinon.stub(),
				$config: { promise: Promise },
			})
		),
		'@noCallThru': true,
	});

	const massiveDatabase__proto__ = massiveDatabase.prototype;

	function initDB(runResolves) {
		let db = Object.create(massiveDatabase__proto__);
		//		massiveDatabase__proto__.constructor.call(db);

		db.run = sinon.stub();

		if (typeof runResolves !== 'undefined') {
			db.run.resolves(runResolves);
		}

		db.syndication = {
			delete_content_es: sinon.stub(),
			delete_save_history_by_contract_id: sinon.stub(),
			get_downloads_by_contract_id: sinon.stub(),
			get_content_es: sinon.stub(),
			get_content_es_by_id: sinon.stub(),
			get_content_total_es: sinon.stub(),
			get_contract_data: sinon.stub(),
			get_contributor_purchase: sinon.stub(),
			get_health_contracts: sinon.stub(),
			get_health_downloads: sinon.stub(),
			get_health_saved_items: sinon.stub(),
			get_migrated_user: sinon.stub(),
			get_saved_items_by_contract_id: sinon.stub(),
			get_user: sinon.stub(),
			upsert: sinon.stub(),
			upsert_content: sinon.stub(),
			upsert_content_es: sinon.stub(),
			upsert_contract: sinon.stub(),
			upsert_contract_asset: sinon.stub(),
			upsert_contract_asset_item: sinon.stub(),
			upsert_contract_asset_register: sinon.stub(),
			upsert_contract_users: sinon.stub(),
			upsert_migrated_user: sinon.stub(),
			upsert_history: sinon.stub(),
			upsert_user: sinon.stub(),
		};

		return db;
	}

	beforeEach(function() {
		sinon.stub(massiveDatabase__proto__, 'constructor').returns(initDB());
		sinon.stub(massiveDatabase__proto__, 'query');
		sinon.stub(massiveDatabase__proto__, 'run');
	});

	afterEach(function() {
		if (massiveDatabase__proto__.constructor.restore) {
			massiveDatabase__proto__.constructor.restore();
		}

		if (massiveDatabase__proto__.query.restore) {
			massiveDatabase__proto__.query.restore();
		}
	});

	return { initDB, massiveDatabase__proto__ };
};
