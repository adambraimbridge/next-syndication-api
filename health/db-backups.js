'use strict';

const path = require('path');
const util = require('util');

const AWS = require('aws-sdk');
const moment = require('moment');

const nHealthCheck = require('n-health/src/checks/check');
const nHealthStatus = require('n-health/src/checks/status');
const { default: log } = require('@financial-times/n-logger');

const {
	AWS_ACCESS_KEY,
	AWS_REGION = 'eu-west-1',
	AWS_SECRET_ACCESS_KEY,
	DB
} = require('config');

const S3 = new AWS.S3({
	accessKeyId: AWS_ACCESS_KEY,
	region: AWS_REGION,
	secretAccessKey: AWS_SECRET_ACCESS_KEY
});

S3.listObjectsV2Async = util.promisify(S3.listObjectsV2);

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

module.exports = exports = new (class S3PostgreSQLBackupCheck extends nHealthCheck {
	constructor(...args) {
		super(...args);

		this.interval = 1000 * 60 * 30;
	}

	async tick() {
		const START = Date.now();

		this.status = nHealthStatus.PENDING;

		this.checkOutput = 'None';

		const timestamp = (moment().isSameOrAfter(moment().startOf('hour').add(10, 'minutes')) ? moment() : moment().subtract(1, 'hour')).format(DB.BACKUP.date_format);

		let res = await S3.listObjectsV2Async({
			Bucket: DB.BACKUP.bucket.id,
			MaxKeys: 5,
			Prefix: `${DB.BACKUP.bucket.directory}/${DB.BACKUP.schema}.${timestamp}`
		});

		const ok = !!res.Contents.length;

		this.status = ok === true ? nHealthStatus.PASSED : nHealthStatus.FAILED;

		log.info(`${MODULE_ID} in ${Date.now() - START}ms => ${this.checkOutput}`);

		return this.checkOutput;
	}
})({
	businessImpact: 'The Syndication hourly database backups have not run for the last hour, this could result in loss of data if we need to restore the database after a fatal crash.',
	name: 'Syndication hourly database backups',
	panicGuide: 'todo',
	severity: 1,
	technicalSummary: 'Checks the database backup cron is running and that a zip file — containing the schema dump file and data dump file — for the previous hour has been uploaded to S3.'
});

exports.start();
