'use strict';

const { CronJob } = require('cron');

const callback = require('./callback');

const { CRON: { backup_redshift } } = require('config');

module.exports = exports = new CronJob({
	cronTime: backup_redshift,
	onTick: callback,
	start: false
});
