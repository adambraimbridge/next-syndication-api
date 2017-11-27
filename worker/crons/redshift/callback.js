'use strict';

const { createReadStream/*, stat*/, writeFile } = require('fs');
const path = require('path');
const util = require('util');

const { default: log } = require('@financial-times/n-logger');

const AWS = require('aws-sdk');
const moment = require('moment');
const S3UploadStream = require('s3-upload-stream');
const { mkdir, rm } = require('shelljs');

const pg = require('../../../db/pg');

const {
	AWS_ACCESS_KEY,
	AWS_REGION = 'eu-west-1',
	AWS_SECRET_ACCESS_KEY,
	REDSHIFT
} = require('config');

const S3 = new AWS.S3({
	accessKeyId: AWS_ACCESS_KEY,
	region: AWS_REGION,
	secretAccessKey: AWS_SECRET_ACCESS_KEY
});

//const statAsync = util.promisify(stat);
const writeFileAsync = util.promisify(writeFile);

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

module.exports = exports = async () => {
	const START = Date.now();
	const time = moment().format(REDSHIFT.date_format_file);
	const directory = path.resolve(`./tmp/redshift/${time}`);

	try {
		mkdir('-p', directory);

		log.info(`${MODULE_ID} | Running redshift backup`);

		const db = await pg();

		const contract_data = await writeCSV({
			directory,
			headers: REDSHIFT.export_headers.contract_data,
			items: await db.syndication.get_redshift_contract_data([]),
			name: 'contract_data',
			time
		});

		const downloads = await writeCSV({
			directory,
			headers: REDSHIFT.export_headers.downloads,
			items: await db.syndication.get_redshift_downloads([]),
			name: 'downloads',
			time
		});

		const saved_items = await writeCSV({
			directory,
			headers: REDSHIFT.export_headers.saved_items,
			items: await db.syndication.get_redshift_saved_items([]),
			name: 'saved_items',
			time
		});

		await Promise.all([
			contract_data,
			downloads,
			saved_items
		].map(async item => await upload(item)));

		log.info(`${MODULE_ID} | redshift backup uploaded to s3`);

	}
	catch (e) {
		log.error(`${MODULE_ID} => `, e);
	}

	log.info(`${MODULE_ID} complete in => ${Date.now() - START}ms`);

	rm('-rf', directory);
};

function safe(value) {
	switch (Object.prototype.toString.call(value)) {
		case '[object Date]':
			value = moment(value).format(REDSHIFT.date_format_cell);
			break;

		case '[object Array]':
		case '[object Object]':
			value = JSON.stringify(value);
			break;
	}

	if (String(value).includes('"')) {
		// remove all the double quotes in a string as it can
		// mess up the csv formatting
		value = value.replace(/"/gm, '\"');
	}

	if (String(value).includes(',')) {
		return `"${value}"`;
	}

	return value;
}

function upload({ file, name }) {
	return new Promise((resolve, reject) => {
		const { bucket } = REDSHIFT;

		const client = new S3UploadStream(S3);

		const upload = client.upload({
			Bucket: bucket.id,
			ContentType: 'text/plain',
			Key: `${bucket.directory}/${name}`,
			ServerSideEncryption: bucket.encryption_type
		});

		upload.on('error', err => reject(err));
		upload.on('uploaded', res => {
			log.info(`${MODULE_ID} | uplodaded: ${name} => `, res);

			resolve(res);
		});

//		upload.on('part', part => console.log(part));

		return file.pipe(upload);
	});
}

async function writeCSV({ items, directory, headers, name, time }) {
	const CSV = [Array.from(headers).join(',')];

	CSV.push(...items.map(item => headers.map(key => safe(item[key])).join(',')));

	const file = path.resolve(directory, `${name}.${time}.txt`);

	await writeFileAsync(file, CSV.join('\n'), 'utf8');

	return {
		file: createReadStream(file),
		name: `${name}.${time}.txt`
	};
}
