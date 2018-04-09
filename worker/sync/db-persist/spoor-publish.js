'use strict';

const path = require('path');

const { default: log } = require('@financial-times/n-logger');
const fetch = require('n-eager-fetch');

const {
	DOWNLOAD_STATE_MAP
} = require('config');

const pg = require('../../../db/pg');
const messageCode = require('../../../server/lib/resolve/messageCode');

const PACKAGE = require(path.resolve('./package.json'));
const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

module.exports = exports = async (event) => {
	try {
		const db = await pg();

		const [contract] = await db.syndication.get_contract_data([event.contract_id]);

		log.info(`${MODULE_ID} RECEIVED => `, event);

		event.canBeSyndicated = event.syndication_state;

		if (event.state in DOWNLOAD_STATE_MAP || event.state === 'interrupted') {
			event.canDownload = 1;

			event.downloaded = true;
		}

		event.message_code = messageCode(event, contract);

		const data = {
			action: getTrackingAction(event.state, event.tracking.referrer),
			category: 'syndication',
			context: {
				app: 'Syndication',
				edition: 'uk',
				product: 'next'
			},
			device: {
				spoor_session_is_new: true,
				ip: event.tracking.ip_address,
				spoor_id: event.tracking.spoor_id,
				spoor_session: event._id
			},
			system: {
				api_key: 'qUb9maKfKbtpRsdp0p2J7uWxRPGJEP',
				product: 'Syndication',
				source: PACKAGE.name,
				version: PACKAGE.version
			},
			context: {
				id: event._id,
				article_id: event.content_id.split('/').pop(),
				contractID: event.contract_id,
				appVersion: PACKAGE.version,
				languageVersion: event.iso_lang_code,
				message: event.message_code,
				referrer: event.tracking.referrer,
				route_id: event._id,
				url: event.tracking.url,
				syndication_content: event.content_type
			},
			user: {
				ft_session: event.tracking.session
			}
		};


		if (event.download_format) {
			data.context.fileformat = event.download_format;
		}

		if (process.env.NODE_ENV !== 'production') {
			data.context.isTestEvent = true;
		}


		const headers = {
			'accept': 'application/json',
			'content-type': 'application/json',
			'content-Length': new Buffer(JSON.stringify(data)).length,
			'cookie': event.tracking.cookie,
			'spoor-id': event.tracking.spoor_id,
			'spoor-ticket': event._id,
			'user-agent': event.tracking.user_agent,
		};

		if (process.env.NODE_ENV === 'production') {
			let res = await fetch('https://spoor-api.ft.com/ingest', {
				headers,
				method: 'POST',
				body: JSON.stringify(data)
			});

			if (res.ok) {
				let payload = await res.json();

				log.info(`${MODULE_ID} PUBLISHED => ${JSON.stringify(data)} ` , payload);
			}
			else {
				let error = await res.text();

				log.error(`${MODULE_ID} ERROR => `, error);
			}

		}
		else {
			log.info(`${MODULE_ID} NOT PUBLISHED => ${JSON.stringify(data)}`);
		}
	}
	catch (e) {
		log.error(`${MODULE_ID} ERROR => `, e);
	}
};

function getTrackingAction(state, referrer = '') {
	switch (state) {
		case 'complete':
			if (referrer.includes('/republishing/download')) {
				return 'redownload-completion';
			}
			else if (referrer.includes('/republishing/save')) {
				return 'download-saved-items-completion';
			}
			else {
				return 'download-completion';
			}
			break;
		case 'deleted':
			if (referrer.includes('/republishing/download')) {
				return 'delete-saved-items-downloads-page';
			}
			else {
				return 'delete-saved-items';
			}

			break;
		case 'error':
			if (referrer.includes('/republishing/download')) {
				return 'redownload-error';
			}
			else if (referrer.includes('/republishing/save')) {
				return 'error-downloading-saved-items';
			}
			else {
				return 'download-error';
			}
			break;
		case 'interrupted':
			if (referrer.includes('/republishing/download')) {
				return 'redownload-interrupted';
			}
			else if (referrer.includes('/republishing/save')) {
				return 'download-saved-items-interrupted';
			}
			else {
				return 'download-interrupted';
			}
			break;
		case 'saved':
			if (referrer.includes('/republishing/download')) {
				return 'save-for-later-downloads-page';
			}
			else {
				return 'save-for-later';
			}

			break;
		case 'started':
			if (referrer.includes('/republishing/download')) {
				return 'redownload-initiation';
			}
			else if (referrer.includes('/republishing/save')) {
				return 'download-saved-items-initiation';
			}
			else {
				return 'download-initiation';
			}
			break;
	}

	return 'UNKNOWN';
}
