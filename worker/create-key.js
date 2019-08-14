'use strict';

const { stat, writeFile } = require('fs');
const path = require('path');
const util = require('util');
const log = require('../server/lib/logger');

const { THE_GOOGLE } = require('config');

const statAsync = util.promisify(stat);
const writeFileAsync = util.promisify(writeFile);

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

module.exports = exports = async function createKey (AUTH_DATA = THE_GOOGLE) {
	const FILE_PATH = path.resolve(AUTH_DATA.AUTH_FILE_NAME);

	try {
		const stat = await statAsync(FILE_PATH);

		if (stat.isFile()) {
			log.info(`${MODULE_ID} => Key exists: ${FILE_PATH}`);

			return false;
		}
	}
	catch (e) {}

	log.info(`${MODULE_ID} => Creating key: ${FILE_PATH}`);

	await writeFileAsync(FILE_PATH, JSON.stringify(AUTH_DATA.AUTH_KEY, null, 2).replace(/\\\\n/g, '\\n') + '\n', {
		encoding: 'utf8',
		mode: '0644'
	});

	log.info(`${MODULE_ID} => Created key: ${FILE_PATH}`);

	return true;
};
