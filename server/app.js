'use strict';

process.env.TZ = 'UTC';

const express = require('@financial-times/n-express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const { BASE_URI_PATH = '/syndication' } = require('config');

const accessControl = require('./middleware/access-control');
const apiKey = require('./middleware/api-key');
const cache = require('./middleware/cache');
const checkIfNewSyndicationUser = require('./middleware/check-if-new-syndication-user');
const db = require('./middleware/db');
const decodeSession = require('./middleware/decode-session');
const expediteUserAuth = require('./middleware/expedite-user-auth');
const flagMaintenanceMode = require('./middleware/flag-maintenance-mode');
const getContractById = require('./middleware/get-contract-by-id');
const getUserAccessAuthToken = require('./middleware/get-user-access-auth-token');
const getSyndicationLicenceForUser = require('./middleware/get-syndication-licence-for-user');
const getUserProfile = require('./middleware/get-user-profile');
const isSyndicationUser = require('./middleware/is-syndication-user');
const logRequest = require('./middleware/log-request');
const masquerade = require('./middleware/masquerade');
const routeMaintenanceMode = require('./middleware/route-maintenance-mode');

const app = module.exports = express({
	systemCode: 'next-syndication-api',
	withFlags: true,
	healthChecks: [
		require('../health/db-backups'),
		require('../health/db-sync-state'),
		require('../health/sqs')
	]
});

const middleware = [
	cookieParser(),
	bodyParser.text(),
	bodyParser.json(),
	bodyParser.urlencoded({ extended: true }),
	logRequest,
	accessControl,
	cache,
	flagMaintenanceMode,
	db,
	decodeSession,
	expediteUserAuth,
	isSyndicationUser,
	masquerade,
	getSyndicationLicenceForUser,
	getUserAccessAuthToken,
	getUserProfile,
	getContractById,
	checkIfNewSyndicationUser,
	routeMaintenanceMode
];

app.get('/__gtg', (req, res) => res.sendStatus(200));

app.get(`${BASE_URI_PATH}/__gtg`, (req, res) => res.sendStatus(200));

// this is here to stop weird error logs, we can't find what exactly is pinging this endpoint
// so this keeps everyone happy... :P
app.get(`${BASE_URI_PATH}/admin/save`, (req, res) => res.sendStatus(204));

// returns the data needed to show the syndication icon and correct messaging for each UUID POSTed in the body
app.post(`${BASE_URI_PATH}/resolve`, middleware, require('./controllers/resolve'));
// returns content items that have been translated into the specified language
app.get(`${BASE_URI_PATH}/translations`, middleware, require('./controllers/translations'));

// returns the syndication user tied to this session
app.get(`${BASE_URI_PATH}/user-status`, middleware, require('./controllers/user-status'));
// returns the syndication contract tied to this session
app.get(`${BASE_URI_PATH}/contract-status`, middleware, require('./controllers/contract-status'));

// internal: get content by UUID, handy for debugging
app.get(`${BASE_URI_PATH}/content/:content_id`, middleware, require('./controllers/get-content-by-id'));

// download a content item for a contract
// IMPORTANT: THIS IS ONLY USED IN DEVELOPMENT. IN PRODUCTION THIS ENDPOINT IS RUN FROM ./app-dl.js
app.get(`${BASE_URI_PATH}/download/:content_id`, middleware, require('./controllers/download-by-content-id'));

// un/save a content item to a contract
app.get(`${BASE_URI_PATH}/save/:content_id`, middleware, require('./controllers/save-by-content-id'));
app.delete(`${BASE_URI_PATH}/save/:content_id`, middleware, require('./controllers/unsave-by-content-id'));
app.post(`${BASE_URI_PATH}/unsave/:content_id`, middleware, require('./controllers/unsave-by-content-id'));

// get a contract's download/save history
app.get(`${BASE_URI_PATH}/history`, middleware, require('./controllers/history'));
// export a contract's download/save history to CSV
app.get(`${BASE_URI_PATH}/export`, middleware, require('./controllers/export'));

// updates a user's preferred download format
app.post(`${BASE_URI_PATH}/download-format`, middleware, require('./controllers/update-download-format'));

// force run migration cron
app.get(`${BASE_URI_PATH}/migrate`, middleware, require('./controllers/migrate'));
// force reload all computed tables in the DB
app.get(`${BASE_URI_PATH}/reload`, middleware, require('./controllers/reload'));
// force ingest of legacy_downloads
app.get(`${BASE_URI_PATH}/legacy_downloads`, middleware, require('./controllers/legacy_downloads'));

if (process.env.NODE_ENV !== 'production') {
	app.get(`${BASE_URI_PATH}/backup`, middleware, require('./controllers/backup'));
	app.get(`${BASE_URI_PATH}/redshift`, middleware, require('./controllers/redshift'));
}

{
	const middleware = [
		cookieParser(),
		bodyParser.text(),
		bodyParser.json(),
		logRequest,
		accessControl,
		cache,
		apiKey
	];

	app.get(`${BASE_URI_PATH}/contracts/:contract_id`, middleware, require('./controllers/get-contract-by-id'));
//	app.post(`${BASE_URI_PATH}/contracts`, middleware, require('./controllers/get-contracts-by-id'));
//	app.get(`${BASE_URI_PATH}/purge`, middleware, require('./controllers/purge'));
}
