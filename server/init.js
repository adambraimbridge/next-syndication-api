'use strict';

const path = require('path');

const { default: log } = require('@financial-times/n-logger');

const CONFIG = require('config');

const app = require('./app');

const PORT = process.env.PORT || CONFIG.PORT || 3255;

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

process.on('uncaughtException', err => {
    log.error(err.stack);
});

app.listen(PORT, () => {
    log.info(`Listening on ${PORT}`);
});

module.exports = app;

process.on('unhandledRejection', (reason, promise) => {
    log.warn(`${MODULE_ID} =>`, promise, reason.stack || reason);
});

process.on('unhandledPromiseRejectionWarning', (reason, promise) => {
    log.warn(`${MODULE_ID} =>`, promise, reason.stack || reason);
});
