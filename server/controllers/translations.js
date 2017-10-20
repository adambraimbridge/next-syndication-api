'use strict';

//const path = require('path');

//const { default: log } = require('@financial-times/n-logger');

const getAllExistingItemsForContract = require('../lib/get-all-existing-items-for-contract');
const getContent = require('../lib/get-content');
const enrich = require('../lib/enrich');
const resolve = require('../lib/resolve');
const messageCode = require('../lib/resolve/messageCode');

const RESOLVE_PROPERTIES = Object.keys(resolve);

const { TRANSLATIONS } = require('config');

//const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

module.exports = exports = async (req, res, next) => {
	let { query: {
		area,
		lang = TRANSLATIONS.DEFAULT_LANGUAGE,
		limit = TRANSLATIONS.PAGINATION.DEFAULT_LIMIT,
		offset = 0,
		query
	} } = req;

	const { locals } = res;
	const { $DB: db, allowed, contract } = locals;

	const content_areas = {};

	switch (lang.toLowerCase()) {
		case 'es':
			if (allowed.spanish_content === true || allowed.spanish_weekend === true) {
				if (typeof area === 'string' && area.length) {
					area = [area.trim().toLowerCase()];
				}
				if (!Array.isArray(area) || !area.length) {
					if (allowed.spanish_content) {
						content_areas['Spanish content'] = true;
					}
					if (allowed.spanish_weekend) {
						content_areas['Spanish weekend'] = true;
					}
				}
				else if (Array.isArray(area)) {
					area = area.map(item => String(item).trim().toLowerCase());

					if (area.includes('sc') && allowed.spanish_content) {
						content_areas['Spanish content'] = true;
					}
					if (area.includes('sw') && allowed.spanish_weekend) {
						content_areas['Spanish weekend'] = true;
					}
				}

				const items = await db.run(`SELECT * FROM syndication.get_content_es(
					${typeof query === 'string' ? `query => $text$${query.trim()}$text$, ` : ''}
					content_areas => ARRAY[$text$${Object.keys(content_areas).join('$text$::syndication.enum_content_area_es, $text$')}$text$::syndication.enum_content_area_es],
					_offset => ${offset}::integer,
					_limit => ${limit}::integer)`);

				items.forEach(item => enrich(item));

				const contentItems = await getContent(items.map(({ content_id }) => content_id));
				const contentItemsMap = contentItems.reduce((acc, item) => {
					acc[item.id] = item;

					// this is for backwards/forwards support with Content API/Elastic Search
					if (item.id.includes('/')) {
						acc[item.id.split('/').pop()] = item;
					}

					return acc;
				}, {});
				const existing = await getAllExistingItemsForContract(contract.contract_id);

				const response = items.map(item => RESOLVE_PROPERTIES.reduce((acc, prop) => {
					acc[prop] = resolve[prop](item[prop], prop, tidy(item, contentItemsMap[item.content_id]), existing[item.id] || {}, contract);

					return acc;
				}, {}));

				response.forEach(item => messageCode(item, contract));

				res.json(response);

				res.status(200);

				next();

				return;
			}
	}

	res.sendStatus(403);
};

function tidy(item, contentItem) {
	delete item.search;

	if (!contentItem.translations) {
		contentItem.translations = {};
	}
	if (!contentItem.translations.es) {
		contentItem.translations.es = item;
	}

	return contentItem;
}
