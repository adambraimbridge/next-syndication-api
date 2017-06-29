'use strict';

const express = require('@financial-times/n-express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const { BASE_URI_PATH = '/syndication' } = require('config');

const accessControl = require('./middleware/access-control');
const cache = require('./middleware/cache');
const checkIfNewSyndicationUser = require('./middleware/check-if-new-syndication-user');
const decodeSession = require('./middleware/decode-session');
const getSyndicationLicenceForUser = require('./middleware/get-syndication-licence-for-user');
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
	checkIfNewSyndicationUser
];

app.get(`${BASE_URI_PATH}/__gtg`, (req, res) => res.sendStatus(200));
//app.get(`${BASE_URI_PATH}/__health`, require('./controllers/__health'));

app.options(`${BASE_URI_PATH}/generate-download-links`, accessControl);
app.post(`${BASE_URI_PATH}/generate-download-links`, middleware, require('./controllers/generate-download-links'));

app.get(`${BASE_URI_PATH}/download`, middleware, require('./controllers/download-by-uri'));
app.get(`${BASE_URI_PATH}/download/:content_id`, middleware, require('./controllers/download-by-content-id'));
