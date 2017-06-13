const log = require('@financial-times/n-logger').default;
const port = process.env.PORT || 3001;
const app = require('./app');

process.on('uncaughtException', err => {
	log.error(err.stack);
});

app.listen(port, () => {
	log.info(`Listening on ${port}`);
});

module.exports = app;

process.on('unhandledRejection', (reason, promise) => {
	log.error(reason, promise);
});
