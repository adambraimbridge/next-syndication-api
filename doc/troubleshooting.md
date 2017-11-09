# troubleshooting

## Syndication icons not appearing

### first port of call

If the syndication icons are not appearing for you or anyone else, but they are for others, the first thing to check is: https://session-next.ft.com/products

Make sure The JSON response has `S1` in the products list, e.g:

```json

    { 
        "uuid": "8ef593a8-eef6-448c-8560-9ca8cdca80a5", 
        "products": "Tools,S1,P0,P2" 
    }

```

More often than not, issues tend to arise from the above endpoint either failing to return, or not returning products correctly.

Also, try refreshing a few times before digging deeper.

### failing that

If this is all fine, the next thing to do is start tailing the logs:

```shell

    ~$ heroku logs --app ft-next-syndication-api --tail --num 0 

```

If the problem is happening for you, check is the `/syndication/user-status` otherwise see if you can get the person who is having the issue to hit the URL while you're tailing the logs and look for any lines that `error: ` this should highlight JavaScript errors.

## Contract details not refreshing

First go to the `/syndication/contract-status?contract_id=${CONTRACT_NUMBER_HAVING_ISSUES}` and look for the `last_updated` property.

The API won't go query Salesforce unless the `last_updated` date is greater than 24 hours. So check the date. If you need to force a refresh, you can do so by connecting to the production DB, e.g. via PGAdmin, and running:

```sql

    UPDATE syndication.contracts 
       SET (last_updated) = (now() - '25 hours'::interval) 
     WHERE contract_id = 'CONTRACT_NUMBER_HAVING_ISSUES';

``` 

## Save/Downloads not showing up

Check the `next-syndication-downloads-prod` SQS queue to see if the events have been processed.

Tail the logs and try saving/downloading an item.

### Downloads not working

Check the `ft-next-syndication-dl` heroku app, make sure it's running, tail its logs and try downloading.

## You've added new secrets in VAULT, rebuilt and things are failing

I don't know why, but for some reason, when I add new secrets for syndication to vault, they don't get included in the heroku config vars, unless I manually add them first and then rebuild/redeploy.

I've asked for help around this, no one has been able to figure it out, but, just in case things go whack for no apparent reason; this could be the reason!  