'use strict';

/**
* IMPORTANT: THIS IS THE MAIN FILE RUN BY: dl.syndication.ft.com
* IMPORTANT: SEE: https://github.com/Financial-Times/next-syndication-dl
* **/

process.env.TZ = 'UTC';

const express = require('@financial-times/n-express');
const cookieParser = require('cookie-parser');

const { BASE_URI_PATH = '/syndication' } = require('config');

const accessControl = require('./middleware/access-control');
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
const logRequest = require('./middleware/log-request');
const routeMaintenanceMode = require('./middleware/route-maintenance-mode');

const app = module.exports = express({
	systemCode: 'next-syndication-dl',
	withBackendAuthentication: false,
	withFlags: true
});

const middleware = [
	accessControl,
	cookieParser(),
	logRequest,
	cache,
	flagMaintenanceMode,
	db,
	decodeSession,
	expediteUserAuth,
	getSyndicationLicenceForUser,
	getUserAccessAuthToken,
	getUserProfile,
	getContractById,
	checkIfNewSyndicationUser,
	routeMaintenanceMode
];

app.get(`${BASE_URI_PATH}/__gtg`, (req, res) => res.sendStatus(200));

// download a content item for a contract
app.get(`${BASE_URI_PATH}/download/:content_id`, middleware, require('./controllers/download-by-content-id'));
