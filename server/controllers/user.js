const Decoder = require('@financial-times/session-decoder-js');
const newSyndicators = require('../new-syndicators');
const decoder = new Decoder(process.env.SESSION_PUBLIC_KEY);

module.exports = (req, res, next) => {
	const sessionToken = req.cookies.FTSession;
	const grabUserUuidFromSession = () => decoder.decode(sessionToken);
	const checkIfUserIsNewSyndicator = uuid => newSyndicators.includes(uuid);

	if (!sessionToken) {
		return res.sendStatus(401);
	}

	res.set('Surrogate-Control', res.FT_NO_CACHE);
	res.set('Cache-Control', res.FT_NO_CACHE);

	Promise.resolve()
		.then(grabUserUuidFromSession)
		.then(checkIfUserIsNewSyndicator)
		.then(isNewSyndicator => res.json({ isNewSyndicator }))
		.catch(next);
};
