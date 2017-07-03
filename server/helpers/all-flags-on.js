'use strict';

const flagIsOn = require('./flag-is-on');

module.exports = exports = (flagDictionary, flag, ...flags) =>
	flagIsOn(flagDictionary[flag]) && (!flags.length || exports(flagDictionary, ...flags));
