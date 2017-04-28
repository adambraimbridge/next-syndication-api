const express = require('@financial-times/n-express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const accessControl = require('./middleware/access-control');
const cache = require('./middleware/cache');
const flags = require('./middleware/flags');
const decodeSession = require('./middleware/decode-session');
const checkIfNewSyndicator = require('./middleware/check-if-new-syndicator');
const app = module.exports = express({
	systemCode: 'next-syndication-api',
	withFlags: true
});

const middleware = [
	cookieParser(),
	bodyParser.text(),
	bodyParser.json(),
	accessControl,
	cache,
	flags,
	decodeSession,
	checkIfNewSyndicator
];

app.options('/generate-download-links', accessControl);
app.post('/generate-download-links', middleware, require('./controllers/generate-download-links'));
app.get('/__gtg', (req, res) => res.sendStatus(200));
