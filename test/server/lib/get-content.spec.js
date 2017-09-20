'use strict';

const path = require('path');

const chai = require('chai');
const proxyquire = require('proxyquire');
//const sinon = require('sinon');
const sinonChai = require('sinon-chai');

const {
	TEST: { FIXTURES_DIRECTORY }
} = require('config');

const { expect } = chai;
chai.use(sinonChai);

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe(MODULE_ID, function () {
	const esClient  = require(path.resolve(`${FIXTURES_DIRECTORY}/n-es-client`));

	const items = [
		'42ad255a-99f9-11e7-b83c-9588e51488a0',
		'ef4c49fe-980e-11e7-b83c-9588e51488a0',
		'b16fce7e-3c92-48a3-ace0-d1af3fce71af',
		'a1af0574-eafb-41bd-aa4f-59aa2cd084c2',
		'98b46b5f-17d3-40c2-8eaa-082df70c5f01',
		'93991a3c-0436-41bb-863e-61242e09859c'
	];

	let underTest;

	beforeEach(function () {
		underTest = proxyquire('../../../server/lib/get-content', {
			'@financial-times/n-es-client': esClient,
			'@noCallThru': true
		});
	});

	afterEach(function () {
	});

	it('return an Array of content items for every content ID it can find', async function () {
		const res = await underTest(items);

		expect(res).to.be.an('array').and.to.have.length(items.length);

		expect(res.map(item => item.id)).to.eql(items.map(content_id => require(path.resolve(`${FIXTURES_DIRECTORY}/content/${content_id}.json`)).id));
	});
});
