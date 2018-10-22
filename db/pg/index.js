'use strict';

const path = require('path');

const { default: log } = require('@financial-times/n-logger');

const massive = require('massive');
const pgConn = require('pg-connection-string');

const { DB } = require('config');

const MODULE_ID =
	path.relative(process.cwd(), module.id) ||
	require(path.resolve('./package.json')).name;

let db;

module.exports = exports = async (options = DB) => {
	if (!db || options !== DB) {
		log.info(`${MODULE_ID} creating new DB instance with options => `, options);

		if (options.uri) {
			const conn = Object.assign(
				{ ssl: { rejectUnauthorized: false } },
				pgConn.parse(options.uri)
			);

			log.info(
				`${MODULE_ID} creating new DB instance with URI String => `,
				conn
			);

			db = await massive(conn);
		} else {
			const conn = {
				database: options.database,
				host: options.host,
				password: options.password,
				port: options.port,
				user: options.user_name,
			};

			if (options.ssl === true) {
				conn.ssl = { rejectUnauthorized: false };
			}

			db = await massive(conn);
		}
	} else {
		log.info(`${MODULE_ID} reloading DB instance => `, db.instance.$cn);

		db = await db.reload();
	}

	return db;
};
