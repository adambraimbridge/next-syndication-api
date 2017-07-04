'use strict';

/* eslint-disable */

const path = require('path');

const { expect } = require('chai');

const underTest = require('../../../../server/lib/resolve/type');

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe(MODULE_ID, function () {
	it('returns the type name of the passed URI in lowercase', function() {
		expect(underTest('http://www.ft.com/ontology/content/Article')).to.equal('article');

		expect(underTest('http://www.ft.com/ontology/content/MediaResource')).to.equal('mediaresource');

		expect(underTest('http://www.ft.com/ontology/content/Package')).to.equal('package');

		expect(underTest('http://www.ft.com/ontology/content/Podcast')).to.equal('podcast');

		expect(underTest('http://www.ft.com/ontology/content/Video')).to.equal('video');
	});
});
