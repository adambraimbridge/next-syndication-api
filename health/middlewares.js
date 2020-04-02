const nHealth = require('n-health');

const { HEALTCHECK_DUMMY_USER_UUID } = require('config');

const panicGuide = 'Contact the FT Accounts team #ft-accounts-team.';
const businessImpact = 'Users will be unable to use the Syndication apps';

const services = [
	{
		name: 'Syndication user rights reachable',
		url: 'https://session-next.ft.com/products',
		technicalSummary:
			'This middleware tests that a user has a valid syndication licence by logging in a dummy user.'
	},
	{
		name: 'Syndication licence reachable',
		url: `https://api.ft.com/licences?userid=${HEALTCHECK_DUMMY_USER_UUID}`,
		technicalSummary:
			'Endpoint the syndication licence details by passing in a unique User ID.'
	},
	{
		name: 'User profile reachable',
		url: `https://api.ft.com/users/${HEALTCHECK_DUMMY_USER_UUID}/profile/basic`,
		technicalSummary:
			'Endpoint to get the user profile details by passing a unique User ID.'
	},
	{
		name: 'User authentication reachable',
		url: 'https://api.ft.com/authorize',
		technicalSummary:
			'Endpoint to get token required to view a user\'s profile details.'
	}
];

module.exports = services.map(svc =>
	nHealth.runCheck(
		Object.assign({}, svc, {
			businessImpact,
			panicGuide,
			severity: 1,
			type: 'pingdom'
		})
	)
);
