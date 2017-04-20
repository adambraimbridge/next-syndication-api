const validateBody = require('../lib/validate-body');
const populateDownloadLinks = require('../lib/populate-download-links');

module.exports = (req, res, next) => {

	validateBody(req.body)
		.then(body => {
			const data = {};

			if (res.locals.isNewSyndicationUser) {
				data.content = body.content.map(populateDownloadLinks);
			}

			return data;
		})
		.then(data => res.json(data))
		.catch(next);
};
