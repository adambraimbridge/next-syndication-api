module.exports = (req, res, next) => {
	if (res.locals.flags && res.locals.flags.syndicationNew) {
		next();
	} else {
		res.sendStatus(404);
	}
};
