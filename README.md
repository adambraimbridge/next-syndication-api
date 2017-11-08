# next-syndication-api

[![CircleCI](https://circleci.com/gh/Financial-Times/next-syndication-api.svg?style=svg)](https://circleci.com/gh/Financial-Times/next-syndication-api)
[![Coverage Status](https://coveralls.io/repos/github/Financial-Times/next-syndication-api/badge.svg?branch=master)](https://coveralls.io/github/Financial-Times/next-syndication-api?branch=master)

The API behind the new FT.com/republishing tool.

## Installation

```shell

    ~$ git clone git@github.com:Financial-Times/next-syndication-api.git

    ~$ cd next-syndication-api

    ~$ make install

```

Alternatively if you want to install the all projects related to the syndication/republishing tool, you can download and run this [shell script](https://github.com/constantology/n-dev-mode/blob/master/project/syndication), or alternatively, use it as a reference.  

## Database dependency

You will need to install PostgreSQL, either using homebrew, docker or from source in order to run the `next-syndication-api`.

Once you have PostgreSQL installed, if you are not using the [shell script](https://github.com/constantology/n-dev-mode/blob/master/project/syndication), you can import the DB schema by following the instructions in [next-syndication-db-schema](https://github.com/Financial-Times/next-syndication-db-schema). 

## Salesforce dependency

Since all contracts live in the production salesforce environment, in order to test locally you will need to use the production `SALESFORCE_*` environment variables rather than the development ones.

### Setting yourself up on a contract

In order to see the syndication icons, you need to belong to a licence with a syndication contract.

Use this link to get set up on the complimentary access licence: https://join.ft.com/4ec865b6-a757-4869-ad0c-e80807c82989  

## Run locally

If you've used the shell script or if you've checked out, installed and built all projects related to the syndication/republishing tool — in the same directory — and want to run all projects easily, you can do so from within the `next-syndication-api`, you will need to:

- update your local [next-router](https://github.com/Financial-Times/next-router)'s `.env` file to include the following:
  
  ```properties
     
     syndication-api=3255
     syn-contract=3984
     syn-list=3566
     
  ```
- restart `next-router`
- `cd` into `next-syndication-api` and `make run-local`

This will start the `next-syndication-api` the associated worker processes and the republishing contract and history pages using [PM2](https://www.npmjs.com/package/pm2) and tail the logs for all HTTP servers/processes.

You can also run `make run-monit` to bring up the [PM2 process monitor](https://www.npmjs.com/package/pm2#cpu--memory-monitoring).

### Emails

Emails are sent by the `db-persist` worker using nodemailer and gmail. 

If you are getting an `ETIMEDOUT` errors, this is probably because the connection is being blocked by the FT firewall.

You can test this by running (from terminal):

```shell

    ~$ openssl s_client -crlf -connect smtp.gmail.com:465

```

The last line of your out put should look something like this:

```shell

    220 smtp.gmail.com ESMTP q4sm4655414wmd.3 - gsmtp

```

If the last line of your output looks more like this:


```shell

    connect: Operation timed out
    connect:errno=60

```

Then you can't connect to the mail server.

Try turning wifi off on your phone to tether your computer to your phone's 4G connection and you should find it now works.


## Maintenance mode

To turn maintenance mode on, simply turn the `syndicationMaintenance` flag on for everyone.

Conversely, turn it off again to turn maintenance mode off.
