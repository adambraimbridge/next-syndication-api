# API

## Authentication

The user facing API has no extra authentication for syndication, it is all handled via FT's standard sign in and uses the user-agent's cookie.

### Masquerading

Aside from saving and downloading content, you can masquerade as a different contract by passing `contract_id=${VALID_CONTRACT_NUMBER}` in the query string of any __public__ endpoint defined that uses contract information.

This works locally for anyone. In production it currently only works for `christos constandinou`'s UUID. Since he was the only developer on this project from start till his leaving date and since there was never any requirement to be able to masquerade as different users and/or contracts, this was added as a quick way of checking contracts. __You will definitely want to replace his UUID__ with your own and/or whoever is supporting production. At the same time, __it would definitely be worth implementing an *actual solution*!__.

See [server/middleware/masquerade.js](https://github.com/Financial-Times/next-syndication-api/blob/master/server/middleware/masquerade.js#L6) for implementation — cough...🤧 hack 😅 — details...

This also works for the `/republishing/contract` endpoint and can be handy for viewing contract details when debugging.

## Endpoints (public)

### GET /syndication/user-status

This is the first endpoint called by the [n-syndication](https://github.com/Financial-Times/n-syndication) module to determine whether the user is a new syndication user and returns information about what features the user — and more importantly, the contract they're on — is `allowed` access to, e.g. `contributor_content`, `spanish_weekend`, etc, etc...

#### Example Request

```shell

    curl -X GET \
        https://www.ft.com/syndication/user-status \
        -H 'content-type: application/json' \
        -H 'cookie: $USERS_COOKIE_GOES_HERE';

```

#### Example Response

```json

    {
        "app": { "name": "ft-next-syndication-api", "version": "x.x.x" },
        "features": { "syndication": true, "syndicationNew": true },
        "allowed": {
            "contributor_content": true,
            "ft_com": true,
            "spanish_content": true,
            "spanish_weekend": true
        },
        "contract_id": "FTS-14098765",
        "contributor_content": true,
        "licence_id": "a0b1c2d3-e4f5-g6h7-i9j0-k1l2m3n4o5p6",
        "migrated": true,
        "user_id": "z0y8x7w6-v5u4-t3s2-r1q0-p9o8n7m6l5k4",
        "email": "john.q.average@ft.com",
        "first_name": "john",
        "surname": "average",
        "download_format": "docx",
        "last_modified": "2017-11-09T09:33:14.391Z",
    }

```

### GET /syndication/contract-status

Returns information about the contract the requesting user is on. This is the information shown on the contract details page — `/republishing/contract`.

#### Example Request

```shell

    curl -X GET \
        https://www.ft.com/syndication/contract-status \
        -H 'content-type: application/json' \
        -H 'cookie: $USERS_COOKIE_GOES_HERE';

```

#### Example Response

```json

    {
        "contract_id": "FTS-14098765",
        "licence_id": "a0b1c2d3-e4f5-g6h7-i9j0-k1l2m3n4o5p6",
        "licencee_name": "Worldwide computer ganster gods",
        "start_date": "2017-07-24T00:00:00.000Z",
        "end_date": "2017-12-31T00:00:00.000Z",
        "contributor_content": true,
        "client_publications": "ft.com",
        "client_website": "ft",
        "last_updated": "2017-11-09T08:25:02.279Z",
        "owner_name": "Francis E. Dec",
        "owner_email": "francis.dec@ft.com",
        "last_modified": "2017-11-09T09:27:31.592Z",
        "items": [ {
            "assets": [ {
                "product": "FT Article",
                "addendums": [ {
                    "asset_id": "01jD000000ABCDEFGH",
                    "embargo_period": 0,
                    "print_usage_limit": 1,
                    "online_usage_limit": 1,
                    "print_usage_period": "Day",
                    "online_usage_period": "Day"
                }, {
                    "asset_id": "01jD000000IJKLMNOP",
                    "embargo_period": 60,
                    "print_usage_limit": 1,
                    "online_usage_limit": 1,
                    "print_usage_period": "Day",
                    "online_usage_period": "Day"
                } ],
                "asset_type": "FT Article",
                "asset_class": "New",
                "content_set": [ null ],
                "contract_id": "FTS-14098765",
                "content_type": "article",
                "last_modified": "2017-11-09T08:25:02.279937+00:00",
                "embargo_period": 60,
                "contract_asset_id": "01jD000000ABCDEFGH",
                "print_usage_limit": 0,
                "online_usage_limit": 0,
                "print_usage_period": "Year",
                "online_usage_period": "Year",
                "content": ""
            } ],
            "asset_type": "FT Article",
            "contract_id": "FTS-14098765",
            "content_type": "article",
            "last_modified": "2017-11-09T09:27:31.592406+00:00",
            "download_limit": 20000,
            "embargo_period": 60,
            "remaining_count": 19805,
            "current_downloads": { "day": 1, "week": 10, "year": 95, "month": 15, "total": 95 },
            "legacy_download_count": 100,
            "hasAddendums": true
        } ],
        "legacy_download_history_count": 11,
        "contract_date": "24/07/17 - 31/12/17",
        "content_allowed": "Articles",
        "allowed": { "contributor_content": true, "ft_com": true, "spanish_content": true, "spanish_weekend": true },
        "MY_DOWNLOAD_FORMAT": "docx"
    }

```

### POST /syndication/resolve

This endpoint is called by the [n-syndication](https://github.com/Financial-Times/n-syndication) module — passing all the content UUIDs it can find on a given page — to get syndication data back for each content UUID it has sent.

The reason this is a `POST` and not a `GET` is because some pages, e.g. the `next-front-page` can have upwards of 50 items to display syndication icons for.

This would very easily exceed the 2,083 character URI limit.

#### Example Request

```shell

    curl -X POST \
        https://www.ft.com/syndication/resolve \
        -H 'content-type: application/json' \
        -H 'cookie: $USERS_COOKIE_GOES_HERE' \
        -d '[
                "c3e9b81a-c477-11e7-b2bb-322b2cb39656",
                "a22ff86e-ba37-11e7-9bfb-4a9c83ffa852"
            ]';

```

#### Example Response

```json

    [
        {
            "id": "c3e9b81a-c477-11e7-b2bb-322b2cb39656",
            "canDownload": 1,
            "canBeSyndicated": "yes",
            "downloaded": false,
            "embargoPeriod": 60,
            "lang": "en",
            "publishedDate": "2017-11-08T11:53:29.000Z",
            "publishedDateDisplay": "8th Nov 2017",
            "saved": false,
            "title": "China’s Tencent builds $2bn stake in Snapchat parent company",
            "type": "article",
            "wordCount": 429,
            "messageCode": "MSG_2000"
        },
        {
            "id": "a22ff86e-ba37-11e7-9bfb-4a9c83ffa852",
            "canDownload": 1,
            "canBeSyndicated": "yes",
            "downloaded": false,
            "embargoPeriod": 60,
            "lang": "en",
            "publishedDate": "2017-11-08T05:02:10.000Z",
            "publishedDateDisplay": "8th Nov 2017",
            "saved": false,
            "title": "Electric cars’ green image blackens beneath the bonnet",
            "type": "article",
            "wordCount": 1934,
            "messageCode": "MSG_2000"
        }
    ]


```

### GET /syndication/translations

Currently this only supports `lang=es` and is used to display spanish content and perform searches on `/republishing/spanish`.

#### Supported query params are:

Query Param | Type | Description
------------ | ------------- | -------------
lang | enum(es) | __REQUIRED__. The language to return translations for.
area | enum(sc,sw)[] | __OPTIONAL__. Limit what's returned to either `sc` (Spanish content) or `sw` (Spanish weekend). Passing both is the same as passing none.
query | String | __OPTIONAL__. A search query to reduce the number of results by.
field | enum(translated, published) | __OPTIONAL__. Defaults to `translated`. When supplying a `from` and/or `to` date, compare the dates from this field.
from | Date(YYYY-MM-DD) | __OPTIONAL__. Only return results whose `field` date is after this date, exclusive.
to | Date(YYYY-MM-DD) | __OPTIONAL__. Only return results whose `field` date is on or before this date, inclusive.
sort | enum(translated, published, relevance) | __OPTIONAL__. Defaults to `translated` is no `query` is given and `relevance` if a `query` is.
order | enum(desc, asc) | __OPTIONAL__. Defaults to `desc`.
offset | Integer | __OPTIONAL__. Defaults to `0`. The index to return results from.
limit | Integer | __OPTIONAL__. Defaults to `50`. The max number of items to return.

#### Example Request

```shell

    curl -X GET \
        https://www.ft.com/syndication/translations?lang=es&query=telefone&from=2017-10-01&to=2017-11-30&offset=2&limit=2&area=sc&area=sw \
        -H 'content-type: application/json' \
        -H 'cookie: $USERS_COOKIE_GOES_HERE';

```

#### Example Response

```json

    {
        "items": [
            {
                "content_id": "40a86de6-b5dd-11e7-a398-73d59db9e399",
                "content_type": "article",
                "content_area": "Spanish content",
                "byline": "Gregory Meyer y Joe Rennison",
                "title": "Empresas de inversión de Wall Street empiezan a comercializar criptomonedas",
                "translated_date": "2017-10-23T08:01:01.000Z",
                "state": "created",
                "last_modified": "2017-10-31T17:30:14.937Z",
                "word_count": "640",
                "published_date": "2017-10-22T17:10:14.000Z",
                "type": "article",
                "wordCount": 640,
                "lang": "es",
                "id": "40a86de6-b5dd-11e7-a398-73d59db9e399",
                "canDownload": 1,
                "canBeSyndicated": "yes",
                "downloaded": false,
                "embargoPeriod": 60,
                "publishedDate": "2017-10-22T17:10:14.000Z",
                "publishedDateDisplay": "22nd Oct 2017",
                "saved": false,
                "previewText": "DRW y otras buscan beneficiarse de las grandes fluctuaciones de los precios del Bitcoin",
                "translatedDate": "2017-10-23T08:01:01.000Z",
                "translatedDateDisplay": "23rd Oct 2017",
                "messageCode": "MSG_2000"
            },
            {
                "content_id": "081b2240-ae7e-11e7-aab9-abaa44b1e130",
                "content_type": "article",
                "content_area": "Spanish weekend",
                "byline": "Andrew Hill",
                "title": "¿Puede Satya Nadella, el jefe de Microsoft, restaurar la gloria de la compañía?",
                "translated_date": "2017-10-19T07:01:01.000Z",
                "state": "created",
                "last_modified": "2017-10-31T17:30:14.937Z",
                "word_count": "1854",
                "published_date": "2017-10-13T10:41:37.000Z",
                "type": "article",
                "wordCount": 1854,
                "lang": "es",
                "id": "081b2240-ae7e-11e7-aab9-abaa44b1e130",
                "canDownload": 1,
                "canBeSyndicated": "yes",
                "downloaded": true,
                "embargoPeriod": 60,
                "publishedDate": "2017-10-13T12:00:22.000Z",
                "publishedDateDisplay": "13th Oct 2017",
                "saved": false,
                "previewText": "Durante el almuerzo en Lord's, este aficionado y exjugador de críquet habla sobre la empatía y la sombra ...",
                "translatedDate": "2017-10-19T07:01:01.000Z",
                "translatedDateDisplay": "19th Oct 2017",
                "messageCode": "MSG_2100"
            }
        ],
        "total": 7
    }

```

### GET /syndication/content/:content_uuid

Returns a single content item. This is used to return content for the Spanish article page — `/republishing/spanish/:content_uuid`.

#### Supported query params are:

Query Param | Type | Description
------------ | ------------- | -------------
lang | enum(en, es) | __OPTIONAL__. The language to return content in. Will only return Spanish `es` if it has an actual translated version.

#### Example Request

```shell

    curl -X GET \
        https://www.ft.com/syndication/content/286ad07a-c415-11e7-b2bb-322b2cb39656 \
        -H 'content-type: application/json' \
        -H 'cookie: $USERS_COOKIE_GOES_HERE';

```

#### Example Response

```json

    {
        "content_id": "286ad07a-c415-11e7-b2bb-322b2cb39656",
        "content_type": "article",
        "content_area": "Spanish content",
        "byline": "Ed Crooks y Robin Wigglesworth",
        "title": "Argentina insta a EEUU a imponer un embargo total al petróleo venezolano",
        "body": "<p>...</p>",
        "translated_date": "2017-11-09T08:01:01.000Z",
        "state": "created",
        "last_modified": "2017-11-09T00:08:43.833Z",
        "word_count": "626",
        "published_date": "2017-11-08T12:05:55.000Z",
        "id": "286ad07a-c415-11e7-b2bb-322b2cb39656",
        "canBeSyndicated": "yes",
        "firstPublishedDate": "2017-11-08T12:05:55.000Z",
        "publishedDate": "2017-11-08T12:05:55.000Z",
        "url": "https://www.ft.com/content/286ad07a-c415-11e7-b2bb-322b2cb39656",
        "webUrl": "http://www.ft.com/cms/s/286ad07a-c415-11e7-b2bb-322b2cb39656.html",
        "lang": "es",
        "type": "article",
        "extension": "xml",
        "bodyHTML": "<p>...</p>",
        "wordCount": 626,
        "bodyHTML__CLEAN": "<p>...</p>",
        "bodyHTML__PLAIN": "<p>...</p>",
        "fileName": "FT_Argentina_in",
        "canDownload": 1,
        "downloaded": false,
        "embargoPeriod": 60,
        "publishedDateDisplay": "8th Nov 2017",
        "saved": false,
        "previewText": "El presidente argentino es el primer líder latinoamericano que aboga abiertamente por acciones tan duras",
        "translatedDate": "2017-11-09T08:01:01.000Z",
        "translatedDateDisplay": "9th Nov 2017",
        "messageCode": "MSG_2000"
    }

```

### GET /syndication/save/:content_uuid

Saves a content item against the user's contract.

#### Supported query params are:

Query Param | Type | Description
------------ | ------------- | -------------
lang | enum(en, es) | __OPTIONAL__. The language to flag the content as saved in. Will only do this for Spanish `es` if it has an actual translated version.

#### Example Request

```shell

    curl -X GET \
        https://www.ft.com/syndication/save/286ad07a-c415-11e7-b2bb-322b2cb39656 \
        -H 'content-type: application/json' \
        -H 'cookie: $USERS_COOKIE_GOES_HERE';

```

#### Example Response

This endpoint returns a `204` when successfully saved.

### DELETE /syndication/save/:content_uuid`
aliased as `GET /syndication/unsave/:content_uuid`

If a content item has been saved against a contract, calling this endpoint will flag it as deleted in the DB. So it will no longer be shown in the contract's `Saved Items`.

The reason this is aliased as a `GET` is because `next-router` does not proxy `DELETE` requests.

#### Supported query params are:

Query Param | Type | Description
------------ | ------------- | -------------
lang | enum(en, es) | __OPTIONAL__. The language the content was flagged as saved in. Will only do this for Spanish `es` if it has an actual translated version.

#### Example Request

```shell

    curl -X GET \
        https://www.ft.com/syndication/unsave/286ad07a-c415-11e7-b2bb-322b2cb39656 \
        -H 'content-type: application/json' \
        -H 'cookie: $USERS_COOKIE_GOES_HERE';

```

#### Example Response

This endpoint returns a `204` when successfully unsaved.

### GET /syndication/download/:content_uuid

Initiates a download for the given content UUID, see [doc/05 Download.png](https://github.com/Financial-Times/next-syndication-api/blob/master/doc/05%20Download.png) for details.

#### IMPORTANT

Remember in production this will be running from: `https://dl.syndication.ft.com/syndication/download/:content_uuid`.

#### Supported query params are:

Query Param | Type | Description
------------ | ------------- | -------------
lang | enum(en, es) | __OPTIONAL__. The language to downloaded the content in. Will only do this for Spanish `es` if it has an actual translated version.
format | enum(docx, html, plain, xml) | __OPTIONAL__. The format to download the article — or transcript if a video/podcast — in. Defaults to the user's default format.

#### Example Request

```shell

    curl -X GET \
        https://www.ft.com/syndication/download/286ad07a-c415-11e7-b2bb-322b2cb39656 \
        -H 'content-type: application/json' \
        -H 'cookie: $USERS_COOKIE_GOES_HERE';

```

#### Example Response

Returns a ReadableStream with `content-disposition: attachment`.

### GET /syndication/history

Returns the saved or download history for the user's contract.

#### Supported query params are:

Query Param | Type | Description
------------ | ------------- | -------------
type | enum(downloads, saved) | __OPTIONAL__. Defaults to `downloads` Whether to return download or save history.
offset | Integer | __OPTIONAL__. Defaults to `0`. The index to return results from.
limit | Integer | __OPTIONAL__. Defaults to `50`. The max number of items to return.

#### Example Request

```shell

    curl -X GET \
        https://www.ft.com/syndication/history?type=saved&offset=0&limit=2 \
        -H 'content-type: application/json' \
        -H 'cookie: $USERS_COOKIE_GOES_HERE';

```

#### Example Response

```json

    {
        "items": [
            {
                "_id": "9d5272af0a36ca429249c25899a64f88",
                "contract_id": "FTS-14098765",
                "asset_type": "FT Article",
                "user_id": "b2697f93-52d3-4d42-8409-bdf91b09e894",
                "content_id": "315daef2-b1c1-11e7-aa26-bb002965bce8",
                "time": "2017-10-27T08:36:13.308Z",
                "state": "saved",
                "user_name": "Joe Blogs",
                "user_email": "joe.blogs@ft.com",
                "content_type": "article",
                "title": "La fuerza de la extrema derecha austriaca se hace sentir más allá de Viena",
                "published_date": "2017-10-15T17:02:51.000Z",
                "syndication_state": "yes",
                "last_modified": "2017-11-07T10:42:35.829Z",
                "content_url": "http://www.ft.com/cms/s/315daef2-b1c1-11e7-aa26-bb002965bce8.html",
                "iso_lang_code": "es",
                "downloaded": true,
                "saved": true,
                "id": "315daef2-b1c1-11e7-aa26-bb002965bce8",
                "date": "27 October 2017",
                "published": "15 October 2017",
                "canDownload": 0,
                "canBeSyndicated": "verify",
                "embargoPeriod": 60,
                "lang": "es",
                "publishedDate": "2017-10-15T17:02:51.000Z",
                "publishedDateDisplay": "15th Oct 2017",
                "type": "article",
                "wordCount": 546,
                "translatedDateDisplay": "9th Nov 2017",
                "messageCode": "MSG_2100"
            },
            {
                "_id": "45bd7ff4e01052bb77a839766e1e69d9",
                "contract_id": "FTS-14098765",
                "asset_type": "FT Article",
                "user_id": "b2697f93-52d3-4d42-8409-bdf91b09e894",
                "content_id": "eb5982b4-b3ff-11e7-a398-73d59db9e399",
                "time": "2017-10-26T08:56:45.876Z",
                "state": "saved",
                "user_name": "Joe Blogs",
                "user_email": "joe.blogs@ft.com",
                "content_type": "article",
                "title": "La ira, el \"hombre cohete\" y el precio de la vanidad de Donald Trump",
                "published_date": "2017-10-19T04:01:05.000Z",
                "syndication_state": "yes",
                "last_modified": "2017-11-07T10:42:35.829Z",
                "content_url": "http://www.ft.com/cms/s/eb5982b4-b3ff-11e7-a398-73d59db9e399.html",
                "iso_lang_code": "es",
                "downloaded": true,
                "saved": true,
                "id": "eb5982b4-b3ff-11e7-a398-73d59db9e399",
                "date": "26 October 2017",
                "published": "19 October 2017",
                "canDownload": 0,
                "canBeSyndicated": "verify",
                "embargoPeriod": 60,
                "lang": "es",
                "publishedDate": "2017-10-19T04:01:05.000Z",
                "publishedDateDisplay": "19th Oct 2017",
                "type": "article",
                "wordCount": 877,
                "translatedDateDisplay": "9th Nov 2017",
                "messageCode": "MSG_2100"
            }
        ],
        "total": 30
    }

```

### GET /syndication/export

This is exactly like `/syndication/history` defined above, only it returns a CSV which is downloaded by the user-agent.

#### Supported query params are:

Query Param | Type | Description
------------ | ------------- | -------------
type | enum(downloads, saved) | __OPTIONAL__. Defaults to `downloads` Whether to return download or save history.

#### Example Request

```shell

    curl -X GET \
        https://www.ft.com/syndication/export?type=saved \
        -H 'content-type: application/json' \
        -H 'cookie: $USERS_COOKIE_GOES_HERE';

```

#### Example Response

Returns a Buffer with `content-disposition: attachment`.

### POST /syndication/download-format

If a valid `format` is given, updates the user's preferred download format.

#### Example Request

```shell

    curl -X POST \
        https://www.ft.com/syndication/downlaad-format \
        -H 'content-type: application/json' \
        -H 'cookie: $USERS_COOKIE_GOES_HERE'
        -d '{
            "format": "docx"
        }';

```

#### Example Response

This endpoint returns a `204` when successfully updated.

## Endpoints (private)

The endpoints defined here are only able to be run in production by `christos constandinou`'s UUID. Since he was the only developer on this project from start till his leaving date and since there was never any requirements for the below. __You will definitely want to replace his UUID__ with your own and/or whoever is supporting production. At the same time, __it would definitely be worth implementing an *actual solution*!__.

### GET /syndication/migrate

This endpoint can be deprecated once the migration is complete and exists as a way of arbitrarily executing the migration cron task. E.g. If you made a mistake with a contract's legacy download count and you want to fix it immediately, you could update the spreadsheet and then call this endpoint to have the change propagated immediately.

#### Example Request

```shell

    curl -X GET \
        https://www.ft.com/syndication/migrate \
        -H 'content-type: application/json' \
        -H 'cookie: $USERS_COOKIE_GOES_HERE';

```

#### Example Response

This endpoint returns a:
`200` and will update the `syndication-migration` slack channel when data was successfully mnigrated.
`204` when run without error but no changes were detected.

### GET /syndication/reload

Reloads all computed tables. I.e. calls the `syndication.reload_all()` stored procedure.

This can be handy to have in the unlikely case where the DB's computed tables become insanely out of sync.

#### Example Request

```shell

    curl -X GET \
        https://www.ft.com/syndication/reload \
        -H 'content-type: application/json' \
        -H 'cookie: $USERS_COOKIE_GOES_HERE';

```

#### Example Response

This endpoint returns a `204` when successfully complete.

## Endpoints (non-production)

These endpoints exist as wrappers to the functionality contained in the cron workers.

They are not available in production and are strictly for you to functionally test the cron callbacks work.

### GET /syndication/backup

Runs the DB backup and uploads it to S3.

#### Example Request

```shell

    curl -X GET \
        https://www.ft.com/syndication/backup \
        -H 'content-type: application/json' \
        -H 'cookie: $USERS_COOKIE_GOES_HERE';

```

#### Example Response

This endpoint returns a `204` when successfully complete.

### GET /syndication/legacy_downloads

Ingests the legacy downloads from the legacy downloads google sheet.

#### Example Request

```shell

    curl -X GET \
        https://www.ft.com/syndication/legacy_downloads \
        -H 'content-type: application/json' \
        -H 'cookie: $USERS_COOKIE_GOES_HERE';

```

#### Example Response

This endpoint returns a `204` when successfully complete.

### GET /syndication/redshift

Creates the redshift CSVs and uploads the to S3.

#### Example Request

```shell

    curl -X GET \
        https://www.ft.com/syndication/redshift \
        -H 'content-type: application/json' \
        -H 'cookie: $USERS_COOKIE_GOES_HERE';

```

#### Example Response

This endpoint returns a `204` when successfully complete.
