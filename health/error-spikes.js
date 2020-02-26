const nHealth = require('n-health');

module.exports = nHealth.runCheck({
	type: 'graphiteThreshold',
	metric: 'divideSeries(sumSeries(next.heroku.syndication-api.web_*.express.default_route_GET.res.status.401.count),sumSeries(next.heroku.syndication-api.web_*.express.default_route_GET.res.status.*.count))',
	threshold: 0.10,
	samplePeriod: '15min',
	name: '401 rate for articles is acceptable',
	severity: 1,
	businessImpact: 'Error rate for the syndication-api has exceeded a threshold of 10% over the last 15 minutes.',
	technicalSummary: 'The proportion of 401 (Unauthorized) responses for syndication API requests across all heroku dynos vs all responses is higher than a threshold of 0.10',
	panicGuide: 'Check the heroku logs for the app for any error messages. Possible causes could be incorrect data from Salesforce or Membership’s ALS'
})
