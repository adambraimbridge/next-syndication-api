'use strict';

const flagIsOn = require('./flag-is-on');

module.exports = exports = (flags) =>
    process.env.NODE_ENV !== 'production' && flagIsOn(flags.syndicationRedux);
