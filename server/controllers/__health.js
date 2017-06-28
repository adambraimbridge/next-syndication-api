'use strict';

module.exports = (req, res, next) => {
	res.send({
		schemaVersion: 1,
		name: 'Next FT.com Syndication API',
		systemCode: 'next-syndication-api',
		description: 'Syndication API for ft.com',
		checks: []
	});

	next();
};
/*

let health = {
	"schemaVersion": 1,
	"name": "Next FT.com Syndication API",
	"systemCode": "next-syndication-api",
	"description": "Syndication API for ft.com",
	"checks": [{
		"id": "populated-services",
		"name": "There are items in the router's list of underlying services",
		"ok": ["^/api"],
		"severity": 1,
		"businessImpact": "Requests to Next FT.com urls will not be served content",
		"technicalSummary": "Checks that items are present in the list of services used to route requests to underlying microservices",
		"panicGuide": "Check that the service registry is working at https://next-registry.ft.com/v2/routed-services.json",
		"lastUpdated": "2017-05-23T14:48:15.439Z"
	}]
}
*/
