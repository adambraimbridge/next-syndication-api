const expect = require('chai').expect;
const populateDownloadLinks = require('../../../server/lib/populate-download-links');

describe('Populate download links', () => {
	it('should populate content objects with an array of download links', () => {
		const populatedLinks = populateDownloadLinks({ uuid: '123' });

		expect(populatedLinks.links).to.be.an('array');
	});

	context('Link array objects', () => {
		it('should contain a `format` string', () => {
			const populatedLinks = populateDownloadLinks({ uuid: '123' });

			expect(populatedLinks.links[0].format).to.be.a('string');
		});

		it('should contain a `url` string', () => {
			const populatedLinks = populateDownloadLinks({ uuid: '123' });

			expect(populatedLinks.links[0].url).to.be.a('string');
		});

	});
});
