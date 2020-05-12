'use strict';

const log = require('../lib/logger');
const Decoder = require('@financial-times/session-decoder-js');

const decoder = new Decoder(process.env.SESSION_PUBLIC_KEY);


module.exports = exports = (req, res, next) => {
	const sessionToken = req.cookies.FTSession;
	const sessionSecureToken = req.cookies.FTSession_s;

	if (!sessionToken || !sessionSecureToken) {
		res.redirect(`https://accounts.ft.com/login?location=${req.originalUrl}`);
		return;
	}

	try {
		res.locals.userUuid = decoder.decode(sessionToken);
		next();
	}
	catch (err) {
		log.error({
			event: 'DECODE_SESSION_ERROR',
			error: err,
		});

		// Dodgy session token provided
		return res.sendStatus(400);
	}
};
