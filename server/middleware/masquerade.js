'use strict';

const ACL = {
	user: false,
	superuser: true
};

module.exports = exports = (req, res, next) => {
	let { locals } = res;

	const allowMasquerade = process.env.NODE_ENV !== 'production' || (locals.user && ACL[locals.user.role] === true);

	if (req.query.contract_id && allowMasquerade) {
		locals.MASQUERADING = true;

		locals.syndication_contract = {
			id: req.query.contract_id
		};
	}

	next();
};
