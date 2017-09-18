'use strict';

const RE_EXTRACT_TIME = /TIME=(\[[^\]]+\]):?/;

module.exports = exports = (req, res, next) => {
	let { FT_User } = req.cookies;

	if (!FT_User) {
		if (res.locals.userUuid) {
			res.locals.FT_User = { USERID: res.locals.userUuid };
		}
		else {
			res.sendStatus(401);
		}
	}
	else {
		const [, TIME] = FT_User.match(RE_EXTRACT_TIME);

		FT_User = FT_User.replace(RE_EXTRACT_TIME, '');

		res.locals.FT_User = FT_User.split(':').reduce((acc, item) => {
			const [key, val] = item.split('=');

			if (val && val.startsWith('_') && val.endsWith('_')) {
				acc[key] = val.substring(1, val.length - 1).split('_');
			}
			else {
				acc[key] = val;
			}

			return acc;
		}, { TIME });
	}

	next();
};
