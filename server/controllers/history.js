'use strict';

const log = require('../lib/logger');

const getContent = require('../lib/get-content');
const getHistoryByContractID  = require('../lib/get-history-by-contract-id');
const syndicate = require('../lib/syndicate-content');

module.exports = exports = async (req, res, next) => {
	const START = Date.now();

	try {
		const CONTRACT = res.locals.contract;

		const options = {
			contract_id: CONTRACT.contract_id
		};

		if (req.query.show === 'mine') {
			options.user_id = res.locals.userUuid;
		}

		if (req.query.type) {
			options.type = req.query.type;
		}

		if (req.query.offset) {
			const offset = parseInt(req.query.offset, 10);

			if (typeof offset === 'number' && offset === offset) {
				options.offset = offset;
			}
		}

		if (req.query.limit) {
			const limit = parseInt(req.query.limit, 10);

			if (typeof limit === 'number' && limit === limit) {
				options.limit = limit;
			}
		}

		let history = await getHistoryByContractID(options);

		const contentItemsMap = await getContent(history.items.map(({ id }) => id), true);

		history.items = history.items.map(item => syndicate({
			contract: CONTRACT,
			includeBody: false,
			item,
			src: contentItemsMap[item.id] || contentItemsMap[item.content_id]
		}));

		log.debug(`Retrieved ${history.items.length} items in ${Date.now() - START}ms`);

		if (Array.isArray(history.items)) {
			res.status(200);

			res.json(history);
		}
		else {
			res.sendStatus(400);
		}

		next();
	}
	catch(error) {
		log.error({error});

		res.sendStatus(400);
	}

};
