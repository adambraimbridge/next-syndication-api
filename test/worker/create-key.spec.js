'use strict';

const fs = require('fs');
const path = require('path');
const util = require('util');

const { expect } = require('chai');

const statAsync = util.promisify(fs.stat);
const unlinkAsync = util.promisify(fs.unlink);

const CONFIG = require('config');

const underTest = require('../../worker/create-key');

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe(MODULE_ID, function () {
	let test_config;

	afterEach(async function () {
		await unlinkAsync(path.resolve(test_config.AUTH_FILE_NAME))
	});

	beforeEach(function () {
		const sources = CONFIG.getConfigSources();

		const test = sources.find(item => item.name.endsWith('test.yaml'));

		test_config = test.parsed.THE_GOOGLE;
	});

	it('creates the key if it does not exist', async function () {
		const res = await underTest(test_config);

		expect(res).to.be.true;

		const FILE_PATH = path.resolve(test_config.AUTH_FILE_NAME);
		const stat = await statAsync(FILE_PATH);

		expect(stat.isFile()).to.be.true;

		expect(require(FILE_PATH)).to.eql({
			'type': 'GOOGLE_AUTH_TYPE',
			'project_id': 'GOOGLE_AUTH_PROJECT_ID',
			'private_key_id': 'GOOGLE_AUTH_PRIVATE_KEY_ID',
			'private_key': 'GOOGLE_AUTH_PRIVATE_KEY',
			'client_email': 'GOOGLE_AUTH_CLIENT_EMAIL',
			'client_id': 'GOOGLE_AUTH_CLIENT_ID',
			'auth_uri': 'GOOGLE_AUTH_AUTH_URI',
			'token_uri': 'GOOGLE_AUTH_TOKEN_URI',
			'auth_provider_x509_cert_url': 'GOOGLE_AUTH_AUTH_PROVIDER_X509_CERT_URL',
			'client_x509_cert_url': 'GOOGLE_AUTH_CLIENT_X509_CERT_URL'
		});
	});

	it('does not create the key if it already not exists', async function () {
		let res = await underTest(test_config);

		expect(res).to.be.true;

		res = await underTest(test_config);

		expect(res).to.be.false;
	});
});
