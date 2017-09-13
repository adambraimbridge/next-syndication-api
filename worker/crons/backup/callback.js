'use strict';

const { exec } = require('child_process');
const { stat } = require('fs');
const path = require('path');
const util = require('util');

const { default: log } = require('@financial-times/n-logger');

const moment = require('moment');
const { mkdir/*, rm*/ } = require('shelljs');

//const pg = require('../../../db/pg');

const {
	DB
} = require('config');

const execAsync = util.promisify(exec);
const statAsync = util.promisify(stat);

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

module.exports = exports = async () => {
//	const db = await pg();

	try {
		const time = moment().format('YYYY-MM-DD[T]HH:00');
		const directory = path.resolve(`./tmp/${time}`);

		try {
			if ((await statAsync(directory)).isDirectory()) {
				log.info(`${MODULE_ID} | THROTTLED!!! Already backed up`);

				return;
			}
		}
		catch (e) {}

		mkdir('-p', directory);

		log.info(`${MODULE_ID} | Running backup`);

		let { BACKUP, database, host, password, port, uri, user_name } = DB;

		database = database ? `--dbname ${database}` : '';
		host = host ? `--host ${host}` : '';
		password = password ? `export PGPASSWORD="${password}" && ` : '';
		port = port ? `--port ${port}` : '';
		user_name = user_name ? `--username ${user_name}` : '';

		const data_flags = `--schema ${BACKUP.schema} --data-only`;
		const schema_flags = '--clean --create --schema-only';
		const schema_dump_file = `${directory}/schema.syndication.${time}.sql`;
		const data_dump_file = `${directory}/data.syndication.${time}.sql`;
		const tables = BACKUP.tables.map(item => `--table ${BACKUP.schema}.${item}`).join(' ');

		let dump_data;
		let dump_schema;

		if (uri) {
			dump_data = `${BACKUP.program} ${uri} ${data_flags} ${tables} --file ${data_dump_file}`;

			dump_schema = `${BACKUP.program} ${uri} ${schema_flags} --file ${schema_dump_file}`;
		}
		else {
			dump_data = `${password} ${BACKUP.program} ${database} ${host} ${port} ${user_name} ${schema_flags} --file ${schema_dump_file}`;

			dump_schema = `${password} ${BACKUP.program} ${database} ${host} ${port} ${user_name} ${data_flags} ${tables} --file ${data_dump_file}`;
		}

		await execAsync(`${dump_schema}`);

		await execAsync(`${dump_data}`);

		// todo: upload to s3
	}
	catch (e) {
		log.error(`${MODULE_ID} => `, e);
	}
};
