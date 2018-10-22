'use strict';

const path = require('path');

//const proxyquire = require('proxyquire').noPreserveCache();
//const sinon = require('sinon');

const {
	TEST: { FIXTURES_DIRECTORY },
} = require('config');

module.exports = exports = {
	get: async function(content_id) {
		return Promise.resolve(
			require(path.resolve(`${FIXTURES_DIRECTORY}/content/${content_id}.json`))
		);
	},
	mget: async function() {
		return Promise.resolve(
			require(path.resolve(`${FIXTURES_DIRECTORY}/content/items.json`))
		);
	},
};
