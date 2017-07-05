'use strict';

const path = require('path');

const { default: log } = require('@financial-times/n-logger');

const { FEATURE_FLAGS } = require('config');

const flagIsOn = require('../helpers/flag-is-on');

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

module.exports = exports = async (req, res, next) => {
	try {
		res.status(200);

		res.json({
			features: FEATURE_FLAGS.reduce((acc, flag) => {
				if (flagIsOn(res.locals.flags[flag])) {
					acc[flag] = true;
				}

				return acc;
			}, {}),
			licence_id: res.locals.licence.id,
			user_id: res.locals.userUuid
		});

		next();
	}
	catch(error) {
		log.error(`${MODULE_ID}`, {
			error: error.stack
		});

		res.sendStatus(500);
	}
};
