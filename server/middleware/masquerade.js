'use strict';

const ACL = {
	user: false,
	superuser: true,
	superdooperuser: true,
	superdooperstormtrooperuser: true
};

module.exports = exports = (req, res, next) => {
	let { locals } = res;

	const allowMasquerade = process.env.NODE_ENV !== 'production'
//						|| locals.userUuid === '8ef593a8-eef6-448c-8560-9ca8cdca80a5'
						|| (locals.user && ACL[locals.user.role] === true);

	if (req.query.contract_id && allowMasquerade) {
		locals.MASQUERADING = true;

		locals.syndication_contract = {
			id: req.query.contract_id
		};
	}

	next();
};
