const Decoder = require('@financial-times/session-decoder-js');
const decoder = new Decoder(process.env.SESSION_PUBLIC_KEY);

module.exports = (req, res, next) => {
	const sessionToken = req.cookies.FTSession;

	if (!sessionToken) {
		return res.sendStatus(401);
	}

	try {
		const userUuid = decoder.decode(sessionToken);
		res.locals.userUuid = userUuid;
		next();
	}
	catch (err) {
		// Dodgy session token provided
		return res.sendStatus(400);
	}
};
