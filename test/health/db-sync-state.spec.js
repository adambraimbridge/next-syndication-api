'use strict';

const path = require('path');

const chai = require('chai');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

const nHealthStatus = require('n-health/src/checks/status');

const {
	TEST: { FIXTURES_DIRECTORY }
} = require('config');

const { expect } = chai;

chai.use(sinonChai);

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe(MODULE_ID, function () {
	const { initDB } = require(path.resolve(`${FIXTURES_DIRECTORY}/massive`))();

	let db;
	let underTest;

	before(function () {
		db = initDB();

		db.syndication.get_health_contracts.resolves([{
			get_health_contracts: {
				contract_asset_data: 0,
				contract_assets: 0,
				contract_data: 0,
				contracts: 0
			}
		}]);

		db.syndication.get_health_downloads.resolves([{
			get_health_downloads: {
				save_history: 0,
				saved_items: 0
			}
		}]);

		db.syndication.get_health_saved_items.resolves([{
			get_health_saved_items: {
				download_history: 0,
				downloads: 0
			}
		}]);

		underTest = proxyquire('../../health/db-sync-state', {
			'../db/pg': sinon.stub().resolves(db)
		});
	});

	after(function () {
	});

	describe('#tick', function () {
		it('calls syndication.get_health_contracts to determine the integrity of contracts', async function () {
			await underTest.tick();

			expect(db.syndication.get_health_contracts).to.have.been.called;
		});

		it('calls syndication.get_health_downloads to determine the integrity of downloads', async function () {
			await underTest.tick();

			expect(db.syndication.get_health_downloads).to.have.been.called;
		});

		it('calls syndication.get_health_saved_items to determine the integrity of saved_items', async function () {
			await underTest.tick();

			expect(db.syndication.get_health_saved_items).to.have.been.called;
		});

		it('sets the status to PASSED if all counts are zero', async function () {
			await underTest.tick();

			expect(underTest.status).to.equal(nHealthStatus.PASSED);
		});
	});
});
