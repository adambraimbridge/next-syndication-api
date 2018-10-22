'use strict';

const schedule = require('node-schedule');

const callback = require('./callback');

const {
	CRON: { backup_redshift },
} = require('config');

module.exports = exports = schedule.scheduleJob(backup_redshift, callback);
