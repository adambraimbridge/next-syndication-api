const expect = require('chai').expect;
const buildUserArray = require('../../../server/lib/build-user-array');

// User UUIDs are stored in next-config-vars for PII reasons
describe('Build array of syndication API users', () => {

	it('should return an array of user UUIDs from a comma-separated list in an env var', () => {
		const userArray = buildUserArray({});
		expect(userArray).to.deep.equal(['testUserUuid1', 'testUserUuid2']);
	});

	it('should include user UUIDs from an env var list of awaiting users, when the syndicationNewUsersAwaiting flag is on', () => {
		const userArray = buildUserArray({ syndicationNewUsersAwaiting: true });
		expect(userArray).to.deep.equal(['testUserUuid1', 'testUserUuid2', 'testUserUuid3', 'testUserUuid4']);
	});
});
