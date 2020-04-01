const {
	ProductionConfiguration,
	Authorisation
} = require('@financial-times/n-membership-sdk');
const nHealth = require('n-health');

const {
	ALS_API_KEY,
	HEALTCHECK_DUMMY_USER,
	HEALTCHECK_DUMMY_PASSWORD,
	HEALTCHECK_DUMMY_USER_UUID
} = process.env;

let USER_COOKIE;
let USER_DATA;

const createCookieHeader = cookies =>
	cookies.reduce((accum, { key, token }) => `${accum} ${key}=${token};`, '');

const panicGuide = 'Contact the FT Accounts team #ft-accounts-team.';
const businessImpact = 'Users will be unable to use the Syndication apps';

const middlewares = [
	{
		name: 'Syndication user check reachable',
		url: 'https://session-next.ft.com/products',
		technicalSummary:
			'This middleware tests that a user has a valid syndication licence by logging in a dummy user.'
	},
	{
		name: 'Syndication licence GET reachable',
		url: `https://api.ft.com/licences?userid=${HEALTCHECK_DUMMY_USER_UUID}`,
		technicalSummary:
			'This middleware does the GET the syndication licence details by passing in the unique User ID.'
    },
    {
		name: 'Syndication licence GET reachable',
		url: `https://api.ft.com/users/${HEALTCHECK_DUMMY_USER_UUID}/profile/basic`,
		technicalSummary:
			'This middleware does the GET to get the user profile details by passing the unique User ID.'
    },
    {
		name: 'Syndication licence GET reachable',
		url: `https://api.ft.com/authorize`,
		technicalSummary:
			'This middleware does the GET to get the user profile details by passing the unique User ID.'
	}
];

const init = async () => {
	const config = new ProductionConfiguration({
		originSystemId: 'next-syndication-api',
		loginApiKey: process.env.LOGIN_API_KEY_PROD
	});

	const authorisationSdk = new Authorisation(config);

	USER_COOKIE = await authorisationSdk.login(
		HEALTCHECK_DUMMY_USER,
		HEALTCHECK_DUMMY_PASSWORD,
		true
	);

	middlewares.map(middleware => {
		nHealth.runCheck({
            ...middleware,
            businessImpact,
			panicGuide,
			severity: 1,
			type: 'pingdom',
			interval: '1m',
			callback: data => console.log(data),
			fetchOptions: {
				headers: {
					Cookie: createCookieHeader(USER_COOKIE),
					'X-Api-Key': ALS_API_KEY
				}
			}
		});
	});
};

module.exports = {
	init,
	checks: []
};
