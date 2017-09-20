'use strict';

const path = require('path');

const { default: log } = require('@financial-times/n-logger');

const { EXPORT } = require('config');

const RE_QUOTES = /"/gm;

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

module.exports = exports = async (req, res, next) => {
	const START = Date.now();

	try {
		const { locals: { $DB: db, contract: CONTRACT } } = res;

		let type = req.query.type || 'downloads';

		const EXPORT_HEADERS = EXPORT[type];

		if (!EXPORT_HEADERS) {
			throw new TypeError(`${MODULE_ID} InvalidExportTypeError => ${type}`);
		}

		res.attachment(`export_republishing_${type}_${(new Date()).toJSON()}.csv`);

		const items = await db.run(`SELECT * FROM syndication.get_${type}_by_contract_id($text$${CONTRACT.contract_id}$text$)`);

		const CSV = [];

		CSV.push(Object.keys(EXPORT_HEADERS).map(key => EXPORT_HEADERS[key]).join(','));

		CSV.push(...items.map(item => Object.keys(EXPORT_HEADERS).map(key => safe(item[key])).join(',')));

		res.send(Buffer.from(CSV.join('\n'), 'utf8'));

		res.status(200);

		log.debug(`${MODULE_ID} => exported ${CSV.length} items in ${Date.now() - START}ms`);

		next();
	}
	catch(error) {
		log.error(`${MODULE_ID}`, {
			error: error.stack
		});

		res.sendStatus(400);
	}

};

function safe(value) {
	switch (Object.prototype.toString.call(value)) {
		case '[object Date]':
			value = value.toJSON();
			break;

		case '[object Array]':
		case '[object Object]':
			value = JSON.stringify(value).replace(RE_QUOTES, '\"');
			break;
	}

	if (String(value).includes(',')) {
		return `"${value}"`;
	}

	return value;
}
