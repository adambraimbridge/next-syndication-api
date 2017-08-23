'use strict';

const { stat, writeFile } = require('fs');
const path = require('path');
const util = require('util');

const { default: log } = require('@financial-times/n-logger');

const { THE_GOOGLE } = require('config');

const statAsync = util.promisify(stat);
const writeFileAsync = util.promisify(writeFile);

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

module.exports = exports = async function createKey () {
	const FILE_PATH = path.resolve(THE_GOOGLE.AUTH_FILE_NAME);

	try {
		const stat = await statAsync(FILE_PATH);

		if (stat.isFile()) {
			log.info(`${MODULE_ID} => Key exists: ${FILE_PATH}`);

			return;
		}
	}
	catch (e) {}

	log.info(`${MODULE_ID} => Creating key: ${FILE_PATH}`);

	await writeFileAsync(FILE_PATH, JSON.stringify(THE_GOOGLE.AUTH_KEY, null, 2), { encoding: 'utf8', mode: '0644' });

	log.info(`${MODULE_ID} => Created key: ${FILE_PATH}`);
};
