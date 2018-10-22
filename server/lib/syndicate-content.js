'use strict';

const resolve = require('../lib/resolve');
const resolveES = require('../lib/resolve/lang/es');
const messageCode = require('../lib/resolve/messageCode');

const RESOLVE_PROPERTIES = Object.keys(resolve);
const RESOLVE_PROPERTIES_ES = Object.keys(resolveES);

/**
 contract: Object     => the contract as requested from the DB by `server/middleware/get-contract-by-id.js`.
 item: Object         => the item to be syndicated.
 includeBody: Boolean => if false, the `body`, `bodyHTML` and any variant of either will be removed before returning the item
                         Defaults to `true`.
 src: Object          => in the case where `item` is not the content returned from ElasticSearch
                         `src` would be the ElasticSearch content which would "fill in the gaps"
                         for any missing properties.
 existing: Object     => the item as it exists in the DB
                         `existing` will be passed in when `item` is to be syndicated using
                         the result from `server/lib/get-all-existing-items-for-contract.js`.
 state: Object        => the state of the item from the DB
                         `state` will be passed in when `item is to be syndicated using
                         the result from `syndication.get_content_state_for_contract(text, text).sql`.
**/

module.exports = exports = ({
	contract,
	existing,
	includeBody = true,
	item,
	src,
	state,
}) => {
	if (typeof existing === 'undefined') {
		existing = item;
	}

	if (typeof src === 'undefined') {
		src = {};

		item.notAvailable = true;
	}

	const allProperties = Object.assign({}, src, item);

	RESOLVE_PROPERTIES.forEach(
		prop =>
			(item[prop] = resolve[prop](
				Object.prototype.hasOwnProperty.call(item, prop)
					? item[prop]
					: src[prop],
				prop,
				allProperties,
				existing,
				contract
			))
	);

	switch (item.lang) {
		case 'es':
			RESOLVE_PROPERTIES_ES.forEach(
				prop =>
					(item[prop] = resolveES[prop](
						item[prop],
						prop,
						item,
						existing,
						contract
					))
			);

			break;
	}

	if (Object.prototype.toString.call(state) === '[object Object]') {
		Object.assign(item, state);
	}

	messageCode(item, contract);

	return tidy(item, includeBody);
};

function tidy(item, includeBody) {
	delete item.search;
	delete item.document;

	if (includeBody !== true) {
		delete item.body;
		delete item.bodyHTML;
		delete item.bodyHTML__CLEAN;
		delete item.bodyHTML__PLAIN;

		delete item.extension;
		delete item.fileName;
	}

	return item;
}
