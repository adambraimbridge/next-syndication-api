'use strict';


const log = require('../server/lib/logger');

const { db } = require('../db/connect');

const Contracts = require('../db/tables/contracts');
const History = require('../db/tables/history');

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

		log.debug('CREATE_TABLE => ', contractsTable);
	}
	else {
		log.debug('TABLE_EXISTS => ', Contracts);
	}

	if (createHistory) {
		let historyTable = await db.createTableAsync(History);

		log.debug('CREATE_TABLE => ', historyTable);
	}
	else {
		log.debug('TABLE_EXISTS => ', History);
	}
})();
