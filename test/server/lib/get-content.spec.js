'use strict';

const path = require('path');

const chai = require('chai');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

const {
	TEST: { FIXTURES_DIRECTORY }
} = require('config');

const { expect } = chai;
chai.use(sinonChai);

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe(MODULE_ID, function () {
	const { initDB } = require(path.resolve(`${FIXTURES_DIRECTORY}/massive`))();

	const items = [
		'80d634ea-fa2b-46b5-886f-1418c6445182',
		'2778b97a-5bc9-11e7-9bc8-8055f264aa8b',
		'b59dff10-3f7e-11e7-9d56-25f963e998b2',
		'c7923fba-1d31-39fd-82f0-ba1822ef20d2',
		'd7bf1822-ec58-4a8e-a669-5cbcc0d6a1b2',
		'dbe4928a-5bec-11e7-b553-e2df1b0c3220'
	];

	let db;
	let underTest;

	beforeEach(function () {
		db = initDB([]);
		underTest = proxyquire('../../../server/lib/get-content', {
			'../../db/pg': sinon.stub().resolves(db),
			'./get-content-by-id': async function(content_id)  {
				return Promise.resolve(require(path.resolve(`${FIXTURES_DIRECTORY}/${content_id}`)));
			},
			'@noCallThru': true
		});
	});

	afterEach(function () {
	});

	it('return an Array of content items for every content ID it can find', async function () {
		const res = await underTest(items);

		expect(res).to.be.an('array').and.to.have.length(items.length);

		expect(res).to.eql(items.map(content_id => require(path.resolve(`${FIXTURES_DIRECTORY}/${content_id}`))));
	});
});
