'use strict';

const { CronJob } = require('cron');

const callback = require('./callback');

const { CRON: { backup_database } } = require('config');

module.exports = exports = new CronJob({
	cronTime: backup_database,
	onTick: callback,
	start: false
});
