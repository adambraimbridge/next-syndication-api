'use strict';

const schedule = require('node-schedule');

const callback = require('./callback');

const {
	CRON: { backup_database },
} = require('config');

module.exports = exports = schedule.scheduleJob(backup_database, callback);
