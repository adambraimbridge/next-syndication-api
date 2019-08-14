'use strict';

const path = require('path');
const util = require('util');

const log = require('../server/lib/logger');

const GoogleSpreadsheet = require('google-spreadsheet');

const SPREADSHEET_FUNCTIONS = [
	'addRow',
	'addWorksheet',
	'getCells',
	'getInfo',
	'getRows',
	'makeFeedRequest',
	'removeWorksheet',
	'setAuth',
	'useServiceAccountAuth'
];

const WORKSHEET_FUNCTIONS = [
	'addRow',
	'bulkUpdateCells',
	'clear',
	'del',
	'getCells',
	'getRows',
	'resize',
	'setHeaderRow',
	'setTitle'
];

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

module.exports = exports = async function SpreadSheet({ id, key, mappings }) {
	const ss = new GoogleSpreadsheet(id);

	SPREADSHEET_FUNCTIONS.forEach(fn => ss[`${fn}Async`] = util.promisify(ss[fn]));

	if (typeof key === 'string') {
		key = require(path.resolve(key));
	}

	await ss.useServiceAccountAuthAsync(key);

	log.info(`${MODULE_ID} => SpreadSheet#${id} Authenticated`);

	const info = await ss.getInfoAsync();

	log.info(`${MODULE_ID} => SpreadSheet#${id} Retrieved Info`);

	const worksheets = info.worksheetsMap = ss.worksheetsMap = {};

	await Promise.all(info.worksheets.map(async item => {
		worksheets[item.title] = worksheets[item.id] = item;

		WORKSHEET_FUNCTIONS.map(async fn =>
			item[`${fn}Async`] = util.promisify(item[fn]));

		item.rows = await item.getRowsAsync();

		if (Object.prototype.toString.call(mappings) === '[object Object]' && Object.prototype.toString.call(mappings[item.title]) === '[object Object]') {
			const MAP = mappings[item.title];

			item.rows.forEach((row, i) => {
				row.mapped = {
					__index__: i,
					__last_modified__: new Date(row['app:edited'])
				};

				for (let [key, val] of Object.entries(MAP)) {
					if (key in row) {
						row.mapped[val] = row[key];
					}
				}
			});
		}

		return item;
	}));

	log.info(`${MODULE_ID} => SpreadSheet#${id} Mapped Worksheets`);

	return ss;
};
