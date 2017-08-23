'use strict';

const path = require('path');
const util = require('util');

const GoogleSpreadsheet = require('google-spreadsheet');

const { default: log } = require('@financial-times/n-logger');

//const pg = require('../../../db/pg');

const { THE_GOOGLE: { AUTH_FILE_NAME } } = require('config');

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

let running = false;

module.exports = exports = async () => {
	if (running === true) {
		return;
	}

	running = true;

	try {
		const key = require(path.resolve(AUTH_FILE_NAME));
		const ss = await SS('1SjXTysgKVX2bGQtsFP-9pWhrHepKX8qz3ZGHrGiDhtw', key);

		const worksheets = await Promise.all(ss.info.worksheets.map(async item => await item.getRowsAsync()));
//		const db = await pg();

		log.debug(`${MODULE_ID} | Running migration`);

//		const items = await db.syndication.cleanup_content();

//		log.debug(`${MODULE_ID} | ${items.length} items migrated`);
	}
	catch (e) {
		log.error(`${MODULE_ID} => `, e);
	}

	running = false;
};

async function SS(id, key) {
	const ss = new GoogleSpreadsheet(id);

	[
		'addRow',
		'addWorksheet',
		'getCells',
		'getInfo',
		'getRows',
		'makeFeedRequest',
		'removeWorksheet',
		'setAuth',
		'useServiceAccountAuth'
	].forEach(fn => ss[`${fn}Async`] = util.promisify(ss[fn]));

	await ss.useServiceAccountAuthAsync(key);

	const info = await ss.getInfoAsync();

	[
		'addRow',
		'bulkUpdateCells',
		'clear',
		'del',
		'getCells',
		'getRows',
		'resize',
		'setHeaderRow',
		'setTitle'
	].forEach(fn =>
		info.worksheets.forEach(item =>
			item[`${fn}Async`] = util.promisify(item[fn])));

	return ss;
}
