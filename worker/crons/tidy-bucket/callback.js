'use strict';

const path = require('path');

const { default: log } = require('@financial-times/n-logger');

const AWS = require('aws-sdk');
const mime = require('mime-types');
const moment = require('moment');

const {
	AWS_ACCESS_KEY,
	AWS_REGION = 'eu-west-1',
	AWS_SECRET_ACCESS_KEY,
	DB,
	DOWNLOAD_ARCHIVE_EXTENSION
} = require('config');

const S3 = new AWS.S3({
	accessKeyId: AWS_ACCESS_KEY,
	region: AWS_REGION,
	secretAccessKey: AWS_SECRET_ACCESS_KEY
});

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

module.exports = exports = async () => {
	const START = Date.now();
	const time = moment().format(DB.BACKUP.date_format);

	try {
		log.info(`${MODULE_ID} | Running tidy-bucket`);

		await tidyBackups();

		log.info(`${MODULE_ID} | Finished tidy-bucket`);
	}
	catch (e) {
		log.error(`${MODULE_ID} => `, e);
	}
};

async function tidyBackups() {
	const now = moment();
	const maxKeepHour = now.clone().subtract(24, 'hours');
	const maxKeepDay = now.clone().subtract(30, 'days');
	const keys = [];

	await _tidyBackups({
		maxKeepHour,
		maxKeepDay,
		keys
	});

	if (keys.length) {
		console.log(JSON.stringify(keys, null, 4));

		let chunks = keys.reduce((acc, item) => {
			if (!acc.length || acc[acc.length - 1].length >= 100) {
				acc.push([]);
			}

			acc[acc.length - 1].push(item);

			return acc;
		}, []);

		const responses = await Promise.all(keys.map(async item => {
			return await S3.deleteObject({
				Bucket: DB.BACKUP.bucket.id,
				Key: item.Key
			}).promise();
		}));

		console.log(JSON.stringify(responses.map(({ data }) => data), null, 4));
	}
}

async function _tidyBackups({ maxKeepHour, maxKeepDay, continueFrom, keys }) {
	const params = {
		Bucket: DB.BACKUP.bucket.id,
		MaxKeys: 1000,
		Prefix: `${DB.BACKUP.bucket.directory}/${DB.BACKUP.schema}`
	};

	if (continueFrom) {
		params.StartAfter = continueFrom;
	}

	const res = await S3.listObjectsV2(params).promise();

//	console.log(res.Contents);

	for (let [index, item] of res.Contents.entries()) {
		const date = moment(item.Key.substring(item.Key.indexOf('.') + 1, item.Key.lastIndexOf('.')), DB.BACKUP.date_format);

		if (date.isBefore(maxKeepDay)) {
			keys.push({ Key: item.Key });
		}
		else if (date.isBefore(maxKeepHour)) {
			if (date.hour() !== 0) {
				keys.push({ Key: item.Key });
			}
		}
	}

	if (res.IsTruncated === true) {
		await _tidyBackups({
			maxKeepHour,
			maxKeepDay,
			continueFrom: res.Contents[res.Contents.length - 1].Key,
			keys
		});
	}
}


async function tidyRedshift() {
}
