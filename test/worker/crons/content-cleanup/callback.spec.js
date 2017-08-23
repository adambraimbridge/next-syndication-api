'use strict';

const path = require('path');

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const proxyquire = require('proxyquire');

const {
	TEST: { FIXTURES_DIRECTORY }
} = require('config');

const { expect } = chai;
chai.use(sinonChai);

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe(MODULE_ID, function () {
	let underTest;
	let db;

	const { initDB } = require(path.resolve(`${FIXTURES_DIRECTORY}/massive`))();

	afterEach(function () {
	});

	beforeEach(function () {
		db = initDB();

		db.syndication.cleanup_content.resolves([]);

		underTest = proxyquire('../../../../worker/crons/content-cleanup/callback', {
			'../../db/pg': sinon.stub().resolves(db)
		});
	});

	it('persists a message queue event', async function () {
		await underTest();

		expect(db.syndication.cleanup_content).to.be.called;
	});
});
