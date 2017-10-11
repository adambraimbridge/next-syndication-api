'use strict';

module.exports = exports = (req, res, next) => {
	let { locals } = res;

	if (req.query.contract_id && (process.env.NODE_ENV !== 'production' || locals.userUuid === '8ef593a8-eef6-448c-8560-9ca8cdca80a5')) {
		locals.MASQUERADING = true;

		locals.syndication_contract = {
			id: req.query.contract_id
		};
	}

	next();
};
