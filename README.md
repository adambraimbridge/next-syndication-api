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
