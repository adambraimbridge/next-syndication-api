'use strict';

const path = require('path');

const log = require('../lib/logger');

const { FEATURE_FLAGS } = require('config');

const flagIsOn = require('../helpers/flag-is-on');

const PACKAGE = require(path.resolve('./package.json'));

module.exports = exports = async (req, res, next) => {
	try {
		res.status(200);

		const { locals: {
			allowed,
			contract,
			flags,
			isNewSyndicationUser,
			licence,
			syndication_contract,
			user
		} } = res;

		const userStatus = Object.assign({
			app: {
				env: process.env.NODE_ENV,
				name: PACKAGE.name,
				version: PACKAGE.version
			},

			features: FEATURE_FLAGS.reduce((acc, flag) => {
				if (flagIsOn(flags[flag])) {
					acc[flag] = true;
				}

				return acc;
			}, {}),

			allowed,
			contract_id:  syndication_contract.id,
			contributor_content: contract.contributor_content,
			licence_id: licence.id,
			migrated: !!isNewSyndicationUser
		}, user);

		res.json(userStatus);

		next();
	}
	catch(error) {
		log.error({
			event: 'USER_STATUS_ERROR',
			error
		});

		res.sendStatus(500);
	}
};
