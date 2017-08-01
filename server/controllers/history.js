'use strict';

const path = require('path');

const { default: log } = require('@financial-times/n-logger');

const getHistoryByLicenceID  = require('../lib/get-history-by-licence-id');

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

module.exports = exports = async (req, res, next) => {
	try {
		const LICENCE = res.locals.licence;

		const options = {
			licence_id: LICENCE.id
		};

		if (req.query.include) {
			options.include = req.query.include;
		}

		if (req.query.show === 'mine') {
			options.user_id = res.locals.userUuid;
		}

		if (req.query.type) {
			options.type = req.query.type;
		}

		const items = await getHistoryByLicenceID(options);

		if (Array.isArray(items)) {
			res.status(200);
			res.json(items);
		}
		else {
			res.sendStatus(400);
		}

		next();
	}
	catch(error) {
		log.error(`${MODULE_ID}`, {
			error: error.stack
		});

		res.sendStatus(400);
	}
};
