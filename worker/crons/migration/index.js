'use strict';

const { CronJob } = require('cron');

const callback = require('./callback');
const createKey = require('./create-key');

const { CRON: { migration } } = require('config');

createKey().then(() => {});

module.exports = exports = new CronJob({
	cronTime: migration,
	onTick: callback,
	start: false
});
