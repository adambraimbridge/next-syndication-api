'use strict';

const {
	DEFAULT_DOWNLOAD_FORMAT,
	DEFAULT_DOWNLOAD_LANGUAGE
} = require('config');

const syndicate = require('../lib/syndicate-content');
const getContentById = require('../lib/get-content-by-id');

module.exports = exports = async (req, res, next) => {

	const { locals: { $DB: db, /*allowed,*/ contract, user } } = res;
	const { download_format } = user;

	const format = req.query.format
				|| download_format
				|| DEFAULT_DOWNLOAD_FORMAT;

	const lang = String(req.query.lang || DEFAULT_DOWNLOAD_LANGUAGE).toLowerCase();

	let content = await getContentById(req.params.content_id, format, lang);

	const [{ get_content_state_for_contract: state }] = await db.syndication.get_content_state_for_contract([contract.contract_id, req.params.content_id]);

	if (content) {
		content = syndicate({
			contract,
			item: content,
			src: content,
			state
		});

		res.status(200);

		res.json(content);

		next();
	}
	else {
		res.sendStatus(404);
	}
};
