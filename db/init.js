'use strict';

const path = require('path');

const { default: log } = require('@financial-times/n-logger');

const { db } = require('./connect');

const Contracts = require('./tables/contracts');
const History = require('./tables/history');

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

(async () => {
	const { TableNames } = await db.listTablesAsync();

	let createContracts = true;
	let createHistory = true;

	if (Array.isArray(TableNames)) {
		if (TableNames.includes(Contracts.TableName)) {
			createContracts = false;
		}
		if (TableNames.includes(History.TableName)) {
			createHistory = false;
		}
	}

	if (createContracts) {
		let contractsTable = await db.createTableAsync(Contracts);

		log.debug(`${MODULE_ID} CREATE_TABLE => `, contractsTable);
	}
	else {
		log.debug(`${MODULE_ID} TABLE_EXISTS => `, Contracts);
	}

	if (createHistory) {
		let historyTable = await db.createTableAsync(History);

		log.debug(`${MODULE_ID} CREATE_TABLE => `, historyTable);
	}
	else {
		log.debug(`${MODULE_ID} TABLE_EXISTS => `, History);
	}
})();
