'use strict';

const express = require('@financial-times/n-express');
const cookieParser = require('cookie-parser');

const { BASE_URI_PATH = '/syndication' } = require('config');

const accessControl = require('./middleware/access-control');
const cache = require('./middleware/cache');
const decodeSession = require('./middleware/decode-session');
const getContractById = require('./middleware/get-contract-by-id');
const getUserAccessAuthToken = require('./middleware/get-user-access-auth-token');
const getSyndicationLicenceForUser = require('./middleware/get-syndication-licence-for-user');
const getUserProfile = require('./middleware/get-user-profile');
const logRequest = require('./middleware/log-request');

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
	decodeSession,
	getSyndicationLicenceForUser,
	getUserAccessAuthToken,
	getUserProfile,
	getContractById
];

app.get(`${BASE_URI_PATH}/__gtg`, (req, res) => res.sendStatus(200));

app.get(`${BASE_URI_PATH}/download/:content_id`, middleware, require('./controllers/download-by-content-id'));