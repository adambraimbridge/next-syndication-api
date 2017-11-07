'use strict';

const schedule = require('node-schedule');

const callback = require('./callback');

const { CRON: { legacy_downloads } } = require('config');

module.exports = exports = schedule.scheduleJob(legacy_downloads, callback);
