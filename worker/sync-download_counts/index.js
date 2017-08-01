'use strict';

const worker = require('../index');

const callback = require('./callback');

const event_type = 'sync.download_counts';

worker({ callback, event_type });
