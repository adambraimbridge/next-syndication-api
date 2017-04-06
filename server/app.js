const express = require('@financial-times/n-express');

const app = module.exports = express({
	systemCode: 'next-syndication-api',
	withFlags: true
});

app.get('/__gtg', (req, res) => {
	res.sendStatus(200);
});
