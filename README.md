# next-syndication-api

[![CircleCI](https://circleci.com/gh/Financial-Times/next-syndication-api.svg?style=svg)](https://circleci.com/gh/Financial-Times/next-syndication-api)
[![Coverage Status](https://coveralls.io/repos/github/Financial-Times/next-syndication-api/badge.svg?branch=master)](https://coveralls.io/github/Financial-Times/next-syndication-api?branch=master)
[![Splunk Logs](https://img.shields.io/badge/splunk-logs-brightgreen.svg)](https://financialtimes.splunkcloud.com/en-US/app/search/search?q=search%20source%3D%22%2Fvar%2Flog%2Fapps%2Fheroku%2Fft-next-syndication-api.log%22%20message!%3D%22*Sorry%2C%20the%20file%20you%20have%20requested%20has%20been%20deleted*%22&display.page.search.mode=verbose&dispatch.sample_ratio=1&earliest=-6d&latest=now&sid=1533553215.15335907)

The API behind the new FT.com/republishing tool.

## Installation

```shell

    ~$ git clone git@github.com:Financial-Times/next-syndication-api.git

    ~$ cd next-syndication-api

    ~$ make install

```

The other related projects are:
* [next-syndication-db-schema](https://github.com/Financial-Times/next-syndication-db-schema) - database schema (see Database dependency below)
* [next-syn-list](https://github.com/Financial-Times/next-syn-list) - front-end app for syndication customers (when you click the Republishing link)
* [n-syndication](https://github.com/Financial-Times/n-syndication) - client-side library for syndication icons and overlays which you can `bower link` to an app (e.g. next-front-page) for local development
* [next-syndication-dl](https://github.com/Financial-Times/next-syndication-dl) - downloads app, you are less likely to need to work on this though

## Database dependency

You will need to install PostgreSQL 9.6.x, either using homebrew, docker or from source in order to run the `next-syndication-api`. Do not use PostgreSQL 10+

You can import the DB schema by following the instructions in [next-syndication-db-schema](https://github.com/Financial-Times/next-syndication-db-schema).

If you are using postgres in Docker, you will need to edit your `.env` file to set `DATABASE_HOST` to `192.168.99.100`

## Salesforce dependency

Since all contracts live in the production salesforce environment, in order to test locally you will need to use the production `SALESFORCE_*` environment variables rather than the development ones.

### Setting yourself up on a contract

In order to see the syndication icons, you need to belong to a licence with a syndication contract. Email customer support and ask to be added to a staff syndication licence.

## Run locally

If you've checked out, installed and built all projects related to the syndication/republishing tool — in the same parent directory — and want to run all projects easily, you can do so from within the `next-syndication-api`, you will need to:

- update your local [next-router](https://github.com/Financial-Times/next-router)'s `.env` file to include the following:
  
  ```properties
     
     syndication-api=3255
     syn-contract=3984
     syn-list=3566
     
  ```
- restart `next-router`
- `cd` into `next-syndication-api` and `make run-local`
- go to [https://local.ft.com:5050/syndication/user-status](https://local.ft.com:5050/syndication/user-status) to confirm everything is working

This will start the `next-syndication-api` the associated worker processes and the republishing contract and history pages using [PM2](https://www.npmjs.com/package/pm2) and tail the logs for all HTTP servers/processes.

You can also run `make run-monit` to bring up the [PM2 process monitor](https://www.npmjs.com/package/pm2#cpu--memory-monitoring).

### Configuration

This project and the [next-syndication-dL](https://github.com/Financial-Times/next-syndication-dl) project both use standard next environment variables for storing secrets in vault.

Though a lot of config for these projects is not secret, so rather than pollute vault with generic configuration, a layer has been added on top of the standard environment variables.

Both projects use a library called [config](https://www.npmjs.com/package/config) for which you define a `config/default.yaml` file which can be overlaid by other config files based on naming conventions like `config/${NODE_ENV}.yaml` and/or `config/${require('os').hostname()}.yaml` see the [config module documentation for File Load Order](https://github.com/lorenwest/node-config/wiki/Configuration-Files#file-load-order) for more information. 

All secrets are added to the [generic config](https://github.com/Financial-Times/next-syndication-api/tree/master/config) using the [Custom Environment Variables](https://github.com/lorenwest/node-config/wiki/Environment-Variables#custom-environment-variables) feature provided by the config library, so as to keep in line with `next`'s architecture and maintain no leaking of secrets throughout environments. 

#### next-syndication-dl

You will notice that [next-syndication-dl](https://github.com/Financial-Times/next-syndication-dl) does not have its own `config` directory. 

Don't worry, this is by design: the `config` directory and the `pandoc-dpkg` directories are both symlinked to the root of the project by the `make install` task.

### pandoc-dpkg ... or What the hell is this? 

[pandoc](https://pandoc.org/MANUAL.html) is the command line program that we use to turn our article from HTML into either plain text (`.txt`) or an open office document (`.docx`).

Considering its small file size: including the program as part of the project was much simpler than having to go through the rigmarole of trying to automate deployments of a heroku app with a custom add-on. 

The original proof of concept version of the `next-syndication-api` used a separate stand-alone heroku app with the `pandoc` add-on. 

While there is nothing wrong with this approach, it makes things less confusing and more "performant" now that we can run the program on each dyno running the `next-syndication-api`; rather than a single dyno running any and all calls to the `pandoc` program.  

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

## Shell script
There was a [shell script](https://github.com/constantology/n-dev-mode/blob/master/project/syndication) but this is out of date and not maintained
