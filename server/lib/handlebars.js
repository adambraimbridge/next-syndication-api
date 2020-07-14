'use strict';

const Handlebars = require('handlebars');

module.exports = function () {
	const helpers = {
		ifEquals: function (a, b, options) {
			if (a === b) {
				return options.fn(this);
			}
			return options.inverse(this);
		}
	};

	const handlebars = Handlebars;
	handlebars.registerHelper(helpers);
	return handlebars;
};
