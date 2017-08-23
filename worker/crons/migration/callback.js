'use strict';

const path = require('path');

const { default: log } = require('@financial-times/n-logger');

//const pg = require('../../../db/pg');

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

let running = false;

module.exports = exports = async () => {
	if (running === true) {
		return;
	}

	running = true;

	try {

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
