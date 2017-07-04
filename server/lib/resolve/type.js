'use strict';

const path = require('path');
const url = require('url');

module.exports = exports = item => String(path.basename((url.parse(item)).pathname)).toLowerCase();
