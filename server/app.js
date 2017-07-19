'use strict';

const express = require('@financial-times/n-express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const { BASE_URI_PATH = '/syndication' } = require('config');

const accessControl = require('./middleware/access-control');
const cache = require('./middleware/cache');
const checkIfNewSyndicationUser = require('./middleware/check-if-new-syndication-user');
const decodeSession = require('./middleware/decode-session');
const getAccessAuthToken = require('./middleware/get-access-auth-token');
const getSyndicationLicenceForUser = require('./middleware/get-syndication-licence-for-user');
const getUserProfile = require('./middleware/get-user-profile');
const isSyndicationUser = require('./middleware/is-syndication-user');
const flags = require('./middleware/flags');
const logRequest = require('./middleware/log-request');

const app = module.exports = express({
	systemCode: 'next-syndication-api',
	withFlags: true
});

const middleware = [
	cookieParser(),
	bodyParser.text(),
	bodyParser.json(),
	logRequest,
	accessControl,
	cache,
	flags,
	decodeSession,
	isSyndicationUser,
	getSyndicationLicenceForUser,
	getAccessAuthToken,
	getUserProfile,
	checkIfNewSyndicationUser
];

app.get(`${BASE_URI_PATH}/__gtg`, (req, res) => res.sendStatus(200));
//app.get(`${BASE_URI_PATH}/__health`, require('./controllers/__health'));

app.post(`${BASE_URI_PATH}/resolve`, middleware, require('./controllers/resolve'));

app.get(`${BASE_URI_PATH}/contract-status`, middleware, require('./controllers/contract-status'));
app.get(`${BASE_URI_PATH}/download/:content_id`, middleware, require('./controllers/download-by-content-id'));
app.get(`${BASE_URI_PATH}/history`, middleware, require('./controllers/history'));
app.get(`${BASE_URI_PATH}/save/:content_id`, middleware, require('./controllers/save-by-content-id'));
app.get(`${BASE_URI_PATH}/user-status`, middleware, require('./controllers/user-status'));

if (process.env.NODE_ENV !== 'production') {
	const middleware = [
		cookieParser(),
		bodyParser.text(),
		bodyParser.json(),
		logRequest,
		accessControl,
		cache,
		flags
	];

	app.get(`${BASE_URI_PATH}/contracts/:contract_id`, middleware, require('./controllers/get-contract-by-id'));
//	app.post(`${BASE_URI_PATH}/contracts`, middleware, require('./controllers/get-contracts-by-id'));
//	app.get(`${BASE_URI_PATH}/purge`, middleware, require('./controllers/purge'));
}
