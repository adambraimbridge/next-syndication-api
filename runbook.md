# Syndication Api

API for FT syndication features

## Primary URL

http://ft-next-syndication-api.herokuapp.com


## Service Tier

Bronze


## Lifecycle Stage

Production


## Delivered By

next


## Supported By

next


## Technical Owner

## Stakeholders

- simon.lord
- caspar.debono

## Known About By

- max.bladen-clark
- simon.legg


## Contains Personal Data

True

## Contains Sensitive Data

False

## Host Platform

Heroku

## Architecture

## First Line Troubleshooting

### The app is erroring
This app is a standard Heroku app, so try all the normal things here (bounce the dynos etc). For localised errors, check the user trying to access the application is actually on a syndication licence.

### People can't see their syndication icons
This would happen if a user is not on a licence or they have been removed, or the licence hasn;t been synced with salesforce, which it has an upstream dependency on.

## Second Line Troubleshooting

- You can see the details of a specific contract by calling `GET https://www.ft.com/syndication/contracts/:contract_id` with a valid api key.
- `POST` call to `https://www.ft.com/syndication/contracts/:contract_id/resolve` with a valid api key and a json body which is an array of content ids will return the syndication permissions for each article


### General tips for troubleshooting Customer Products Systems

- [Out of hours runbook for FT.com (wiki)](https://customer-products.in.ft.com/wiki/Out-of-hours-Runbook)
- [General tips for debugging FT.com (wiki)](https://customer-products.in.ft.com/wiki/Debugging-Tips).
- [General information about monitoring and troubleshooting FT.com systems (wiki)](https://customer-products.in.ft.com/wiki/Monitoring-and-Troubleshooting-systems)


## Monitoring

[General information about monitoring and troubleshooting FT.com systems (wiki)](https://customer-products.in.ft.com/wiki/Monitoring-and-Troubleshooting-systems)


### Grafana
[Syndication API Dashboard](http://grafana.ft.com/d/P1fH18Kiz/ft-com-heroku-apps?orgId=1&var-app=syndication-api)

### Pingdom
- [next-syndication-api--eu-gtg](https://my.pingdom.com/reports/responsetime#daterange=7days&tab=uptime_tab&check=4897636)

### Splunk searches

- [index=heroku source="*syndication-api*"](https://financialtimes.splunkcloud.com/en-US/app/search/search?q=search%20index%3Dheroku%20source%3D%22*syndication-api*%22&display.page.search.mode=smart&dispatch.sample_ratio=1&earliest=-1h&latest=now&sid=1565272294.5309696)

## Healthchecks

- ft-next-syndication-api.herokuapp.com-https
- ft-next-syndication-api-https


## Failover Architecture Type

None

## Failover Process Type

Not applicable

## Failback Process Type

Not applicable

## Failover Details

## Data Recovery Process Type

Manual

## Data Recovery Details

https://github.com/Financial-Times/next-syndication-db-schema#restoring-on-production-from-backup

## Release Process Type

Fully Automated

## Rollback Process Type

Manual

## Release Details

## Heroku Pipeline Name

- ft-next-syndication-api

## Key Management Process Type

PartiallyAutomated

## Key Management Details

You can read about how to rotate an AWS key [over on the Customer Products Wiki](https://customer-products.in.ft.com/wiki/Rotating-AWS-Keys)
See the Customer Products [key management and troubleshooting wiki page](https://customer-products.in.ft.com/wiki/Key-Management-and-Troubleshooting)

## Dependencies

- Salesforce
- content-api 
- next-es-interface


