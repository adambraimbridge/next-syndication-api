'use strict';

const worker = require('../index');

const callback = require('./callback');

const type = 'sync.download_counts';

worker({ callback, type });
