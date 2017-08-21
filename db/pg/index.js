'use strict';

const path = require('path');

const { default: log } = require('@financial-times/n-logger');

const massive = require('massive');

const { DB } = require('config');

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

let db;

module.exports = exports = async (options = DB) => {
	if (!db || options !== DB) {
		log.debug(`${MODULE_ID} creting new DB instance with options => `, options);

		if (options.uri) {
			let URI = options.uri;

			if (!URI.includes('sslmode=require')) {
				if (!URI.includes('?')) {
					URI += '?';
				}

				URI += 'sslmode=require'
			}

			db = await massive(URI);
		}
		else {
			db = await massive({
				host: options.host,
				port: options.port,
				database: options.database,
				user: options.user_name,
				password: options.password
			});
		}
	}

	return db;
};
