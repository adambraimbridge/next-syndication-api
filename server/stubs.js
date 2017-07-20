'use strict';

const fs = require('fs');
const path = require('path');

const nock = require('nock');

const {
	TEST: { FIXTURES_DIRECTORY }
} = require('config');

nock('http://ft-next-feature-flags-prod-us.s3-website-us-east-1.amazonaws.com')
	.get('/__flags.json')
	.times(10000)
	.reply(() => {
		return [
			200,
			fs.createReadStream(path.resolve(`${FIXTURES_DIRECTORY}/__flags.json`)),
			{}
		];
	});
