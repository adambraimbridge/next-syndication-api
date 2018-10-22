'use strict';

const path = require('path');

const { default: log } = require('@financial-times/n-logger');

//const Slack = require('node-slack');
const moment = require('moment');

const pg = require('../../../db/pg');
const SpreadSheet = require('../../../spreadsheet');
//const getContractByID = require('../../../server/lib/get-contract-by-id');

const {
	LEGACY_DOWNLOAD_HISTORY_SPREADSHEET_ID,
	//	NODE_ENV,
	//	SLACK,
	SPREADSHEET_MAPPINGS,
	THE_GOOGLE: { AUTH_FILE_NAME },
} = require('config');

const MODULE_ID =
	path.relative(process.cwd(), module.id) ||
	require(path.resolve('./package.json')).name;

log.info(`${MODULE_ID} => started`);

module.exports = exports = async () => {
	log.info(`${MODULE_ID} => Legacy Download History running`);

	try {
		const key = require(path.resolve(AUTH_FILE_NAME));
		const ss = await SpreadSheet({
			id: LEGACY_DOWNLOAD_HISTORY_SPREADSHEET_ID,
			key: key,
			mappings: SPREADSHEET_MAPPINGS,
		});

		const db = await pg();

		const LEGACY_DOWNLOAD_HISTORY_SPREADSHEET_DATE_FORMAT = 'DD/MM/YYYY HH:mm';

		await Promise.all(
			ss.worksheetsMap.legacy_download_history.rows.map(async ({ mapped }) => {
				mapped.published_date = moment(
					mapped.published_date,
					LEGACY_DOWNLOAD_HISTORY_SPREADSHEET_DATE_FORMAT
				).toDate();
				mapped.time = moment(
					mapped.time,
					LEGACY_DOWNLOAD_HISTORY_SPREADSHEET_DATE_FORMAT
				).toDate();
				mapped.last_modified = mapped.__last_modified__;
				return await db.syndication.upsert_legacy_download_history([mapped]);
			})
		);

		log.info(`${MODULE_ID} => Legacy Download History complete`);
	} catch (e) {
		log.error(`${MODULE_ID} => `, e);
	}
};
