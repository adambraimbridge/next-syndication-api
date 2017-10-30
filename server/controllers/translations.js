'use strict';

const getAllExistingItemsForContract = require('../lib/get-all-existing-items-for-contract');
const getContent = require('../lib/get-content');
const enrich = require('../lib/enrich');
const syndicate = require('../lib/syndicate-content');

const { TRANSLATIONS } = require('config');

module.exports = exports = async (req, res, next) => {
	let { query: {
		area,
		lang = TRANSLATIONS.DEFAULT_LANGUAGE,
		limit = TRANSLATIONS.PAGINATION.DEFAULT_LIMIT,
		offset = 0,
		order,
		query,
		sort
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

				let getQuery = `content_areas => ARRAY[$text$${Object.keys(content_areas).join('$text$::syndication.enum_content_area_es, $text$')}$text$::syndication.enum_content_area_es]`;
				let getTotalQuery = getQuery + '';

				if (typeof query === 'string' && query.trim().length) {
					getQuery = `query => $text$${query.trim()}$text$,
${getQuery}`;
					getTotalQuery = getQuery + '';
				}
				else if (typeof sort === 'string' && sort.trim().length) {
					let sortQuery = `sort_col => $text$${sort.trim().toLowerCase()}$text$`;

					if (typeof order === 'string' && order.trim().toUpperCase() === 'ASC') {
						sortQuery = `${sortQuery},
sort_order => $text$ASC$text$`;
					}
					else {
						sortQuery = `${sortQuery},
sort_order => $text$DESC$text$`;
					}

					getQuery = `${sortQuery},
${getQuery}`;
				}

				getQuery = `${getQuery},
_offset => ${offset}::integer,
_limit => ${limit}::integer`;

				const items = await db.run(`SELECT * FROM syndication.get_content_es(${getQuery})`);

				const [{ get_content_total_es }] = await db.run(`SELECT * FROM syndication.get_content_total_es(${getTotalQuery})`);
				const total = parseInt(get_content_total_es, 10);

				items.forEach(item => {
					enrich(item);

					item.lang = lang;
				});

				const contentItemsMap = await getContent(items.map(({ content_id }) => content_id), true);

				const existing = await getAllExistingItemsForContract(contract.contract_id);

				const response = items.map(item => syndicate({
					contract,
					existing: existing[item.content_id],
					includeBody: false,
					item,
					src: contentItemsMap[item.content_id]
				}));

				res.json({ items: response, total });

				res.status(200);

				next();

				return;
			}
	}

	res.sendStatus(403);
};
