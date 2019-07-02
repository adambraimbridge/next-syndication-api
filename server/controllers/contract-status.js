'use strict';

const log = require('../lib/logger');

const { DEFAULT_DOWNLOAD_FORMAT } = require('config');

module.exports = exports = async (req, res, next) => {
	try {
		const { locals: { contract, user } } = res;

		contract.MY_DOWNLOAD_FORMAT = user.download_format || DEFAULT_DOWNLOAD_FORMAT;

		res.status(200);


		res.json(contract);

		next();
	}
	catch (error) {
		log.error({error});

		res.sendStatus(400);
	}
};
