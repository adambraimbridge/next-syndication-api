const express = require('@financial-times/n-express');
const cookieParser = require('cookie-parser');
const app = module.exports = express({
	systemCode: 'next-syndication-api',
	withFlags: true
});

app.get('/user', cookieParser(), require('./controllers/user'));
app.get('/__gtg', (req, res) => res.sendStatus(200));
