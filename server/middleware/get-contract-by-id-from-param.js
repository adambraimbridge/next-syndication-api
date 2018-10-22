'use strict';

const getContractByID = require('../lib/get-contract-by-id');

module.exports = (req, res, next) => {
	const { contract_id } = req.params || {};
	if (!contract_id) {
		return res
			.status(400)
			.send({ message: "Missing path parameter: 'contract_id'" });
	}
	getContractByID(contract_id)
		.then(contract => {
			res.locals.contract = contract;
			next();
		})
		.catch(next);
};
