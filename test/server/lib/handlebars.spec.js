'use strict';

const { expect } = require('chai');
const Handlebars = require('../../../server/lib/handlebars')();

describe('Handlebars with extended helper', function () {
	it('Should register an ifEquals helper', function () {
		expect(Handlebars.helpers).to.haveOwnProperty('ifEquals');
	});

	it('should render a template using ifEquals helper', function () {
		const template = Handlebars.compile('{{#ifEquals propA 1}}propA: render this;{{else}}propA: do not render this{{/ifEquals}}{{#ifEquals propB 5}} propB: do not render this{{else}} propB: render this{{/ifEquals}}');
		const rendered = template({propA: 1, propB: 2});
		expect(rendered).to.eql('propA: render this; propB: render this')
	});
});
