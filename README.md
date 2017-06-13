# next-syndication-api

[![CircleCI](https://circleci.com/gh/Financial-Times/next-syndication-api.svg?style=svg)](https://circleci.com/gh/Financial-Times/next-syndication-api)
[![Coverage Status](https://coveralls.io/repos/github/Financial-Times/next-syndication-api/badge.svg?branch=master)](https://coveralls.io/github/Financial-Times/next-syndication-api?branch=master)

An experimental API to power features of a new syndication system, for syndication customers who have opted into using it.

## Installation

```
git clone git@github.com:Financial-Times/next-syndication-api.git
cd next-syndication-api
make install
```

### INCASE OF `npm install` ERROR

If you get a `node-pre-gyp` error while `fsevents` is installing, which looks something like this:

```shell

    xcode-select: error: tool 'xcodebuild' requires Xcode, but active developer directory '/Library/Developer/CommandLineTools' is a command line tools instance

```

The run the below command [solution from here](https://stackoverflow.com/questions/17980759/xcode-select-active-developer-directory-error/17980786#answer-17980786):

```shell

    ~ $ sudo xcode-select -s /Applications/Xcode.app/Contents/Developer

```

## Run locally

`make run`. Check the [__gtg](https://local.ft.com:3002/__gtg) endpoint to make sure you’re up and running.

## Usage

### POST /generate-download-links

(This is an experimental endpoint and may not survive.) Post a JSON object containing content UUIDs and get their respective download links back.

Prerequisites:

- An FTSession token must be passed via cookie. If you’re logged into FT.com and client-side fetching within a *.ft.com subdomain, you won’t need to worry about this
- Can only be used on a *.ft.com domain (local.ft.com is fine)
- The `syndicationNew` feature flag should be turned on
- Also turn on the `syndicationNewOverride` flag if your user UUID isn’t listed in the syndication-api config vars

Example fetch request:

```
fetch('[syndication-api root]/generate-download-links', {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({
        content: [
            {
                uuid: 'abc123'
            }
        ]
    })
});
```

Returns:

```
{
   content: [
        {
            uuid: "abc123",
            links: [
                {
                    "format": "docx",
                    "url": "[url for docx download]"
                },
                {
                    "format": "html",
                    "url": "[url for html download]"
                },
                {
                    "format": "plain",
                    "url": "[url for plain text download]"
                }
            ]
        }
    ]
}
```
If you’re not in the list of syndication API users and you’re not overriding with the `syndicationNewOverride` flag, this endpoint will return an empty JSON object.

You _can_ send a `Content-Type` of `application/json` if you like, but it’ll trigger a CORS preflight request. It’s up to you, friend.

## FT-New-Syndication-User header

If an existing syndication user has opted into using this new API (i.e. their user UUID is in the list of users), an `FT-New-Syndication-User` header will be returned with a value of `true` in any API responses. Otherwise, the header will not be sent.

Example usage from a fetch response:

```
const isNewSyndicationUser = res.headers.get('FT-New-Syndication-User') === 'true';

if (isNewSyndicationUser) {
    // do new stuff :-)
} else {
    // do old stuff :-(
}
```

## Adding people to the list of syndication API users

### The `syndicationNewUsersAwaiting` flag

The `syndicationNewUsersAwaiting` flag is used as a mechanism to add the next batch of syndication API users (in a controlled way).

Customers are added to the list individually, and are introduced to it in person during a meeting. Therefore we need to be able to enable it for them with a predictable, quick switchover time (avoiding the stress of us waiting for the build to pass/fail).

We store the list of syndication API user UUIDs in a config var called `NEW_SYNDICATION_USERS`. When the `syndicationNewUsersAwaiting` flag is turned on in production, any user UUIDs stored in the _`NEW_SYNDICATION_USERS_AWAITING`_ config var will also be added to the list.

### Steps to add new syndication API users

1. Make sure the syndicationNewUsersAwaiting flag is off in production
2. Well in advance of the proposed switch-on time, add user UUIDs to the NEW_SYNDICATION_USERS_AWAITING string (comma separated) in config vars, redeploy this app
3. Turn on the syndicationNewUsersAwaiting flag when ready to release to the new users (then relax, and follow the clean-up steps)

Cleaning up (please do this)

1. Move the user UUIDs over from NEW_SYNDICATION_USERS_AWAITING to the NEW_SYNDICATION_USERS string and redeploy this app
2. Turn off the syndicationNewUsersAwaiting flag again in production
3. Feel good but also a bit frustated by these steps

(Improvements to this are most welcome and encouraged!)
