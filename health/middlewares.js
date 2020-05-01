const nHealth = require('n-health');

const panicGuide = 'Contact the FT Accounts team #ft-accounts-team.';
const businessImpact = 'Users will be unable to use the Syndication apps';

const services = [
	{
		type: 'pingdom',
		checkId: '4897678',
		type: 'pingdom',
		name: 'User Rights US Service reachable',
		url: 'http://ft-next-session-us.herokuapp.com/__gtg',
		technicalSummary:
			'Endpoint to check that a logged in user has a valid syndication licence.'
	},
	{
		type: 'pingdom',
		checkId: '4897600',
		name: 'User Rights EU Service reachable',
		url: 'http://ft-next-session-eu.herokuapp.com/__gtg',
		technicalSummary:
			'Endpoint to check that a logged in user has a valid syndication licence.'
	},
	{
		type: 'pingdom',
		checkId: '2014224',
		name: 'Licence Service reachable',
		url: 'https://acc-licence-svc.memb.ft.com/__gtg',
		technicalSummary:
			'Endpoint to get the syndication licence details by passing in a unique User ID.'
	},
	{
		type: 'pingdom',
		checkId: '2026757',
		name: 'User Profile Service US reachable',
		url: 'user-profile-svc-lb-us-east-1-prod.memb.ft.com/__gtg',
		technicalSummary:
			'Endpoint to get the user profile details by passing a unique User ID.'
	},
	{
		type: 'pingdom',
		checkId: '2018406',
		name: 'User Profile Service EU reachable',
		url: 'user-profile-svc-at-lb-eu-west-1.memb.ft.com/__health',
		technicalSummary:
			'Endpoint to get the user profile details by passing a unique User ID.'
	},
	{
		type: 'pingdom',
		checkId: '2127222',
		name: 'Auth Service US reachable',
		url: 'https://api-authz-svc-us-prod.memb.ft.com/__health',
		technicalSummary:
			'Endpoint to get token required to view a user\'s profile details.'
	},
	{
		checkId: '2014224',
		name: 'Auth Service EU reachable',
		url: 'https://api-authz-svc-eu-prod.memb.ft.com/__health',
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
