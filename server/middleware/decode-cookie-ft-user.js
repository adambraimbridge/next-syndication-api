'use strict';

//const path = require('path');

//const { default: log } = require('@financial-times/n-logger');

//const {
//} = require('config');

const RE_EXTRACT_TIME = /TIME=(\[[^\]]+\]):?/;

//const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

module.exports = exports = (req, res, next) => {
	let { FT_User } = req.cookies;

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

	next();
};
