'use strict';

const schedule = require('node-schedule');

const callback = require('./callback');

const { CRON: { migration } } = require('config');

module.exports = exports = schedule.scheduleJob(migration, callback);
