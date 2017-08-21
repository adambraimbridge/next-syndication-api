'use strict';

const path = require('path');

const { default: log } = require('@financial-times/n-logger');

const { DEFAULT_DOWNLOAD_FORMAT } = require('config');

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

module.exports = exports = async (req, res, next) => {
	try {
		const { locals: { contract, user } } = res;

		contract.MY_DOWNLOAD_FORMAT = user.download_format || DEFAULT_DOWNLOAD_FORMAT;

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
