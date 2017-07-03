'use strict';

const path = require('path');

const { expect } = require('chai');

const underTest = require('../../../server/helpers/is-media-resource');

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe(MODULE_ID, function () {
	it('returns true if the \`content:Object\` has a \`dataSource:Array\`', function() {
		expect(underTest({
			dataSource: []
		})).to.be.true;
	});

	[
		'http://www.ft.com/ontology/content/MediaResource',
		'http://www.ft.com/ontology/content/Podcast',
		'http://www.ft.com/ontology/content/Video'
	].forEach(type => {
		describe(`Testing type: ${type}`, function() {
			it('returns true if the \`content:Object\` is a media resource', function() {
				expect(underTest({
					type,
					dataSource: []
				})).to.be.true;
			});
		});
	});
	[
		'http://www.ft.com/ontology/content/Article',
		'http://www.ft.com/ontology/content/LiveBlog'
	].forEach(type => {
		describe(`Testing type: ${type}`, function() {
			it('returns false if the \`content:Object\` is NOT a media resource', function() {
				expect(underTest({
					type
				})).to.be.false;
			});
		});
	});
});
