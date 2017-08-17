'use strict';

const { CronJob } = require('cron');

const callback = require('./callback');

const { CRON: { content_cleanup } } = require('config');

const job = module.exports = exports = new CronJob({
	cronTime: content_cleanup,
	onTick: callback,
	start: false
});

job.start();
