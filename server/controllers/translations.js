'use strict';

const moment = require('moment');

const getAllExistingItemsForContract = require('../lib/get-all-existing-items-for-contract');
const getContent = require('../lib/get-content');
const enrich = require('../lib/enrich');
const syndicate = require('../lib/syndicate-content');

const {
	DB: { DATE_FORMAT: DB_DATE_FORMAT },
} = require('config');

module.exports = exports = async (req, res, next) => {
	let {
		query: {
			area,
			field,
			from: date_from,
			lang = 'es',
			limit = 50,
			offset = 0,
			order,
			query,
			sort,
			to: date_to,
		},
	} = req;

	const { locals } = res;
	const { $DB: db, allowed, contract } = locals;

	const content_areas = {};

	switch (lang.toLowerCase()) {
		case 'es':
			if (
				allowed.spanish_content === true ||
				allowed.spanish_weekend === true
			) {
				if (typeof area === 'string' && area.length) {
					area = [area.trim().toLowerCase()];
				}
				if (Array.isArray(area) && area.length) {
					if (area.includes('sc')) {
						content_areas['Spanish content'] = true;
					}
					if (area.includes('sw')) {
						content_areas['Spanish weekend'] = true;
					}
				}

				let getQuery = '';
				let getTotalQuery = '';

				if (typeof query === 'string' && query.trim().length) {
					getQuery += `query => $text$${query.trim()}$text$`;
				}
				if (typeof date_from === 'string' && date_from.length) {
					getQuery += `${getQuery.length ? ', ' : ''}date_from => $ttz$${moment(
						date_from.trim()
					).format(DB_DATE_FORMAT)}$ttz$::timestamp with time zone`;
				}
				if (typeof date_to === 'string' && date_to.length) {
					getQuery += `${getQuery.length ? ', ' : ''}date_to => $ttz$${moment(
						date_to.trim()
					).format(DB_DATE_FORMAT)}$ttz$::timestamp with time zone`;
				}
				if (typeof field === 'string') {
					field = field.trim().toLowerCase();

					if (field === 'published') {
						field = 'published_date';
					} else {
						field = 'translated_date';
					}

					getQuery += `${
						getQuery.length ? ', ' : ''
					}date_col => $text$${field}$text$`;
				}

				const areas = Object.keys(content_areas);

				if (areas.length) {
					getQuery += `${
						getQuery.length ? ', ' : ''
					}areas => ARRAY[$text$${areas.join(
						'$text$::syndication.enum_content_area_es, $text$'
					)}$text$::syndication.enum_content_area_es]`;
				}

				getTotalQuery = `${getQuery}`;

				if (typeof sort === 'string') {
					sort = sort.trim().toLowerCase();

					if (sort === 'published') {
						sort = 'published_date';
					} else if (sort === 'translated') {
						sort = 'translated_date';
					} else {
						sort = 'relevance';
					}

					getQuery += `${
						getQuery.length ? ', ' : ''
					}sort_col => $text$${sort.trim()}$text$`;
				}
				if (typeof order === 'string') {
					order = order.trim().toLowerCase();

					if (order === 'asc') {
						order = 'ASC';
					} else {
						order = 'DESC';
					}

					getQuery += `${
						getQuery.length ? ', ' : ''
					}sort_dir => $text$${order.trim()}$text$`;
				}

				getQuery = `${getQuery}${getQuery.length ? ',' : ''}
_offset => ${offset}::integer,
_limit => ${limit}::integer`;

				const items = await db.run(
					`SELECT * FROM syndication.search_content_es(${getQuery})`
				);

				const [{ search_content_total_es }] = await db.run(
					`SELECT * FROM syndication.search_content_total_es(${getTotalQuery})`
				);
				const total = parseInt(search_content_total_es, 10);

				items.forEach(item => {
					enrich(item);

					item.lang = lang;
				});

				const contentItemsMap = await getContent(
					items.map(({ content_id }) => content_id),
					true
				);

				const existing = await getAllExistingItemsForContract(
					contract.contract_id
				);

				const response = items.map(item =>
					syndicate({
						contract,
						existing: existing[item.content_id],
						includeBody: false,
						item,
						src: contentItemsMap[item.content_id],
					})
				);

				res.json({ items: response, total });

				res.status(200);

				next();

				return;
			}
	}

	res.sendStatus(403);
};
