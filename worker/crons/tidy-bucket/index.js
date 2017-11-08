'use strict';

const schedule = require('node-schedule');

const callback = require('./callback');

const { CRON: { tidy_bucket } } = require('config');

module.exports = exports = schedule.scheduleJob(tidy_bucket, callback);
