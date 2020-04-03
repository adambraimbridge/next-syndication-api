const nHealth = require('n-health');
const statusCode = 401;
const threshold = 2;
const samplePeriod = 60; // minutes

module.exports = nHealth.runCheck({
	type: 'graphiteThreshold',
	metric: `asPercent(summarize(sumSeries(next.heroku.syndication-api.web_*.express.default_route_GET.res.status.${statusCode}.count), "${samplePeriod}min", "sum", true), summarize(sumSeries(next.heroku.syndication-api.web_*.express.default_route_GET.res.status.*.count), "${samplePeriod}min", "sum", true))`,
	threshold,
	samplePeriod: `${samplePeriod}min`,
	name: `${statusCode} rate for articles is acceptable`,
	severity: 1,
	businessImpact: `Error rate for the syndication-api has exceeded a threshold of ${threshold * 100}% over the last ${samplePeriod} minutes.`,
	technicalSummary: `The proportion of ${statusCode} (Unauthorized) responses for syndication API requests across all heroku dynos vs all responses is higher than a threshold of ${threshold} over the last ${samplePeriod} minutes`,
	panicGuide: 'Check the heroku logs for the app for any error messages. Possible causes could be incorrect data from Salesforce or Membership’s ALS'
})
