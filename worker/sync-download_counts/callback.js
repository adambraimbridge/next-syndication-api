'use strict';

const path = require('path');

const moment = require('moment');

const { default: log } = require('@financial-times/n-logger');

const ContractsSchema = require('../../db/table_schemas/contracts');
const getContractByID = require('../../server/lib/get-contract-by-id');
const getHistoryByLicenceID = require('../../server/lib/get-history-by-licence-id');
const persist = require('../persist');

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

module.exports = exports = async (event, message, response, subscriber) => {
	try {
		log.debug(`${MODULE_ID} RECEIVED => `, event);

		const contract = await getContractByID(event.contract_id);

		if (!contract) {
			throw new ReferenceError(`${MODULE_ID} contract not found => `, event);
		}

		if (!contract.download_count) {
			contract.download_count = initDownloadCount();
		}
		else {
			contract.download_count.total = 0;

			for (let [key] of Object.entries(contract.download_count.current)) {
				contract.download_count.current[key] = 0;
			}
		}

		const history = (await getHistoryByLicenceID({
			licence_id: event.licence_id,
			prep_aggregation: true,
			type: 'downloads'
		})).reverse();

		const archive = {};

		const today = moment();
		const current = {
			year: today.format('YYYY'),
			month: today.format('M') - 1,
			week: today.format('W') - 1,
			day: today.format('DDD') - 1
		};

		const historyUnique = history.reduce((acc, item) => {
			if (!(item.content_id in acc)) {
				acc[item.content_id] = item;
			}

			return acc;
		}, {});

		for (let [, item] of Object.entries(historyUnique)) {
			let { aggregate } = item;
			let { year, month, week, day } = aggregate;

			if (!(year in archive)) {
				archive[year] = initArchiveItem(year);
			}

			++archive[year].breakdown.year;

			++archive[year].breakdown.months[month];
			++archive[year].breakdown.weeks[week];
			++archive[year].breakdown.days[day];

			++contract.download_count.total;

			for (let [key, val] of Object.entries(current)) {
				if (aggregate[key] === val) {
					++contract.download_count.current[key];
				}
			}
		}

		contract.download_count.archive = Object.keys(archive).map(year => archive[year]);

		let res = await persist(contract, ContractsSchema);

		log.debug(`${MODULE_ID} PERSISTED => `, res);

		await subscriber.ack(message);
	}
	catch (e) {
		log.error(`${MODULE_ID} => `, e);
	}
};

function initDownloadCount () {
	return {
		legacy: 0,
		total: 0,
		current: {
			day: 0,
			week: 0,
			month: 0,
			year: 0
		}
	};
}

function initArchiveItem(year) {
	const endOfYear = moment(year, 'YYYY').endOf('year');

	return {
		year: endOfYear.format('YYYY'),
		breakdown: {
			year: 0,
			months: makeArray(endOfYear.format('M')),
			weeks: makeArray(endOfYear.format('W')),
			days: makeArray(endOfYear.format('DDD'))
		}
	};
}

function makeArray(length) {
	return '0'.repeat(Number(length)).split('').map(parseFloat);
}
