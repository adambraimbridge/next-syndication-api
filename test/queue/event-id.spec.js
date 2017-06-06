'use strict';

const { expect } = require('chai');

const underTest = require('../../queue/event-id');

describe('queue/event-id', function () {

	it('adds an `_id` if one is missing', function () {
		expect(underTest({})).to.have.property('_id').and.be.a('string');
	});


	it('does not overwrite the `_id` if exists', function () {
		expect(underTest({ _id: 'foo' })).to.have.property('_id').and.be.a('string').and.equal('foo');
	});

});
