'use strict';

const path = require('path');

const { default: log } = require('@financial-times/n-logger');

const { FEATURE_FLAGS } = require('config');

const flagIsOn = require('../helpers/flag-is-on');

const PACKAGE = require(path.resolve('./package.json'));

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

module.exports = exports = async (req, res, next) => {
	try {
		res.status(200);

		res.json(Object.assign({
			app: {
				env: process.env.NODE_ENV,
				name: PACKAGE.name,
				version: PACKAGE.version
			},

			features: FEATURE_FLAGS.reduce((acc, flag) => {
				if (flagIsOn(res.locals.flags[flag])) {
					acc[flag] = true;
				}

				return acc;
			}, {}),

			contract_id: res.locals.syndication_contract.id,
			licence_id: res.locals.licence.id,
			migrated: !!res.locals.isNewSyndicationUser
		}, res.locals.user));

		next();
	}
	catch(error) {
		log.error(`${MODULE_ID}`, {
			error: error.stack
		});

		res.sendStatus(500);
	}
};
