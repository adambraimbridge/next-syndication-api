'use strict';

const { CronJob } = require('cron');

const callback = require('./callback');

const { CRON: { migration } } = require('config');

module.exports = exports = new CronJob({
	cronTime: migration,
	onTick: callback,
	start: false
});
