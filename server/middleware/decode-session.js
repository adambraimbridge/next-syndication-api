'use strict';

const path = require('path');

const { default: log } = require('@financial-times/n-logger');
const Decoder = require('@financial-times/session-decoder-js');
const decoder = new Decoder(process.env.SESSION_PUBLIC_KEY);
const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

module.exports = exports = (req, res, next) => {
	const sessionToken = req.cookies.FTSession;

	log.debug(`${MODULE_ID}`, { gotSessionToken: !!sessionToken });

	if (!sessionToken) {
		return res.sendStatus(401);
	}

	try {
		const userUuid = decoder.decode(sessionToken);

		res.locals.userUuid = userUuid;

		log.debug(`${MODULE_ID} DecodeSessionSuccess`, { gotUserUuid: !!userUuid });

		next();
	}
	catch (err) {
		log.error(`${MODULE_ID} DecodeSessionError`, {
			error: err.stack
		});

		// Dodgy session token provided
		return res.sendStatus(400);
	}
};
