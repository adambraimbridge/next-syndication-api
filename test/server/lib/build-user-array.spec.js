const expect = require('chai').expect;
const buildUserArray = require('../../../server/lib/build-user-array');

// User UUIDs are stored in next-config-vars for PII reasons
describe('Build array of syndication API users', () => {

	it('should return an array of user UUIDs from a comma-separated list in an env var', () => {
		const userArray = buildUserArray({});
		expect(userArray).to.deep.equal(['testUserUuid1', 'testUserUuid2']);
	});

	it('should include user UUIDs from an env var list of awaiting users, when the syndicationNewUsersAwaiting flag is on', () => {
		const userArray = buildUserArray({syndicationNewUsersAwaiting: true});
		expect(userArray).to.deep.equal(['testUserUuid1', 'testUserUuid2', 'testUserUuid3', 'testUserUuid4']);
	});

	describe('no new users', function () {
		const NEW_SYNDICATION_USERS = process.env.NEW_SYNDICATION_USERS;
		const NEW_SYNDICATION_USERS_AWAITING = process.env.NEW_SYNDICATION_USERS_AWAITING;

		after(function () {
			process.env.NEW_SYNDICATION_USERS = NEW_SYNDICATION_USERS;
		});

		before(function () {
			process.env.NEW_SYNDICATION_USERS = '';
		});

		it('should return an empty array when there is no NEW_SYNDICATION_USERS', () => {
			const userArray = buildUserArray({});
			expect(userArray).to.deep.equal([]);
		});

		it('should return only the user UUIDs from an env var list of awaiting users, when no NEW_SYNDICATION_USERS and the syndicationNewUsersAwaiting flag is on', () => {
			const userArray = buildUserArray({syndicationNewUsersAwaiting: true});
			expect(userArray).to.deep.equal(['testUserUuid3', 'testUserUuid4']);
		});

		describe('no users awaiting', function () {
			after(function () {
				process.env.NEW_SYNDICATION_USERS_AWAITING = NEW_SYNDICATION_USERS_AWAITING;
			});

			before(function () {
				process.env.NEW_SYNDICATION_USERS_AWAITING = '';
			});

			it('should return an empty array no NEW_SYNDICATION_USERS and no NEW_SYNDICATION_USERS_AWAITING', () => {
				const userArray = buildUserArray({syndicationNewUsersAwaiting: true});
				expect(userArray).to.deep.equal([]);
			});
		});
	});

});
