'use strict';

const path = require('path');

const { default: log } = require('@financial-times/n-logger');

const {
	DEFAULT_DOWNLOAD_FORMAT,
	DEFAULT_DOWNLOAD_LANGUAGE
} = require('config');

const resolve = require('../lib/resolve');
const resolveES = require('../lib/resolve/lang/es');
const messageCode = require('../lib/resolve/messageCode');
const getContentById = require('../lib/get-content-by-id');

const RESOLVE_PROPERTIES = Object.keys(resolve);
const RESOLVE_PROPERTIES_ES = Object.keys(resolveES);

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

module.exports = exports = async (req, res, next) => {

	const { locals: { $DB: db, contract, user } } = res;
	const { download_format } = user;

	const format = req.query.format
				|| download_format
				|| DEFAULT_DOWNLOAD_FORMAT;

	const lang = String(req.query.lang || DEFAULT_DOWNLOAD_LANGUAGE).toLowerCase();

	let content = await getContentById(req.params.content_id, format, lang);

	const [{ get_content_state_for_contract: state }] = await db.syndication.get_content_state_for_contract([contract.contract_id, req.params.content_id]);

	if (content) {
		content = RESOLVE_PROPERTIES.reduce((acc, prop) => {
			acc[prop] = resolve[prop](content[prop], prop, content, content || {}, contract);

			return acc;
		}, content);

		if (lang === 'es') {
			content = RESOLVE_PROPERTIES_ES.reduce((acc, prop) => {
				acc[prop] = resolveES[prop](content[prop], prop, content, content || {}, contract);

				return acc;
			}, content);
		}

		res.status(200);

		content = cleanup(content);

		Object.assign(content, state);

		messageCode(content, contract);

		log.info(`${MODULE_ID} SUCCESS => `, content);

		res.json(content);

		next();
	}
	else {
		res.sendStatus(404);
	}
};

const REMOVE_PROPERTIES = [
	'document',
	'download'
];

function cleanup(content) {
	REMOVE_PROPERTIES.forEach(property => delete content[property]);

	return content;
}
