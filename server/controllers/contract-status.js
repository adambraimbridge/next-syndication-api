'use strict';

const path = require('path');

const { default: log } = require('@financial-times/n-logger');

const { DEFAULT_DOWNLOAD_FORMAT } = require('config');

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

module.exports = exports = async (req, res, next) => {
	try {
		const { locals: { contract } } = res;

		if (contract.download_formats && contract.download_formats[res.locals.user.id]) {
			contract.MY_DOWNLOAD_FORMAT = contract.download_formats[res.locals.user.id] || DEFAULT_DOWNLOAD_FORMAT;
		}
		else {
			contract.MY_DOWNLOAD_FORMAT = DEFAULT_DOWNLOAD_FORMAT;
		}

		res.status(200);
		res.json(contract);

		next();
	}
	catch (error) {
		log.error(`${MODULE_ID}`, {
			error: error.stack
		});

		res.sendStatus(400);
	}
};
