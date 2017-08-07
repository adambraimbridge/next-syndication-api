'use strict';

const path = require('path');

const moment = require('moment');

const { default: log } = require('@financial-times/n-logger');

const ContractsSchema = require('../../db/table_schemas/contracts');
const getContractByID = require('../../server/lib/get-contract-by-id');
const getHistoryByLicenceID = require('../../server/lib/get-history-by-licence-id');
const persist = require('../persist');

const { CONTENT_TYPE_ALIAS } = require('config');

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

module.exports = exports = async (event, message, response, subscriber) => {
	try {
		log.debug(`${MODULE_ID} RECEIVED => `, event);

		const contract = await getContractByID(event.contract_id);

		if (!contract) {
			throw new ReferenceError(`${MODULE_ID} contract not found => `, event);
		}

		contract.download_count = initDownloadCount(contract.limits);
//		if (!contract.download_count) {
//			contract.download_count = initDownloadCount(contract.limits);
//		}
//		else {
//			contract.download_count.total = 0;
//
//			for (let [key] of Object.entries(contract.download_count.current)) {
//				contract.download_count.current[key] = 0;
//			}
//		}

		const history = (await getHistoryByLicenceID({
			licence_id: event.licence_id,
			prep_aggregation: true,
			type: 'downloads'
		})).reverse();

//		const archive = {};

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

		const historyUniqueByContentType = Object.entries(historyUnique).reduce((acc, [, item]) => {
			let { content_type = 'article' } = item;

			// todo: special case we'll treat it as a video for now
			// todo: but may need further discussion.
			content_type = CONTENT_TYPE_ALIAS[content_type] || content_type;

			if (!Array.isArray(acc[content_type])) {
				acc[content_type] = [];
			}

			acc[content_type].push(item);

			return acc;
		}, {});

		for (let [content_type, items] of Object.entries(historyUniqueByContentType)) {
			contract.download_count.total.total += items.length;
			contract.download_count.total[content_type] += items.length;

			items.forEach(item => {
				let { aggregate } = item;
//				let { year, month, week, day } = aggregate;

				for (let [key, val] of Object.entries(current)) {
					if (aggregate[key] === val) {
						++contract.download_count.current[key].total;
						++contract.download_count.current[key][content_type];
					}
				}

//				if (!(year in archive)) {
//					archive[year] = initArchiveItem(year, contract.limits);
//				}

//				++archive[year].breakdown.year;

//				++archive[year].breakdown.months[month];
//				++archive[year].breakdown.weeks[week];
//				++archive[year].breakdown.days[day];
			});
		}

//		contract.download_count.archive = Object.keys(archive).map(year => archive[year]);

		for (let [key, val] of Object.entries(contract.limits)) {
			contract.download_count.remaining[key] = val - contract.download_count.total[key];
		}

		let res = await persist(contract, ContractsSchema);

		log.debug(`${MODULE_ID} PERSISTED => `, res);

		await subscriber.ack(message);
	}
	catch (e) {
		log.error(`${MODULE_ID} => `, e);
	}
};

function createCountsByLimits (limits) {
	const item = {
		total: 0
	};

	for (let [key, val] of Object.entries(limits)) {
		if (val > -1) {
			item[key] = 0;
		}
	}

	return item;
}

function initDownloadCount (limits) {
	return {
		legacy: createCountsByLimits(limits),
		remaining: createCountsByLimits(limits),
		total: createCountsByLimits(limits),
		current: {
			day: createCountsByLimits(limits),
			week: createCountsByLimits(limits),
			month: createCountsByLimits(limits),
			year: createCountsByLimits(limits)
		}
	};
}

//function initArchiveItem (year, limits) {
//	const endOfYear = moment(year, 'YYYY').endOf('year');
//
//	return {
//		year: endOfYear.format('YYYY'),
//		breakdown: {
//			year: createCountsByLimits(limits),
//			months: makeArray(endOfYear.format('M')),
//			weeks: makeArray(endOfYear.format('W')),
//			days: makeArray(endOfYear.format('DDD'))
//		}
//	};
//}

//function makeArray(length) {
//	return '0'.repeat(Number(length)).split('').map(parseFloat);
//}
