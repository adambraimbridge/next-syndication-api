'use strict';

const { exec } = require('child_process');
const { createReadStream /*, stat*/ } = require('fs');
const path = require('path');
const util = require('util');

const { default: log } = require('@financial-times/n-logger');

const archiver = require('archiver');
const AWS = require('aws-sdk');
const mime = require('mime-types');
const moment = require('moment');
const S3UploadStream = require('s3-upload-stream');
const { mkdir, rm } = require('shelljs');

//const pg = require('../../../db/pg');

const {
	AWS_ACCESS_KEY,
	AWS_SECRET_ACCESS_KEY,
	DB,
	DOWNLOAD_ARCHIVE_EXTENSION,
} = require('config');

const S3 = new AWS.S3({
	accessKeyId: AWS_ACCESS_KEY,
	region: 'eu-west-1',
	secretAccessKey: AWS_SECRET_ACCESS_KEY,
});

const execAsync = util.promisify(exec);
//const statAsync = util.promisify(stat);

const MODULE_ID =
	path.relative(process.cwd(), module.id) ||
	require(path.resolve('./package.json')).name;

module.exports = exports = async () => {
	const START = Date.now();
	const time = moment().format(DB.BACKUP.date_format);
	const directory = path.resolve(`./tmp/backup/${time}`);

	try {
		mkdir('-p', directory);

		log.info(`${MODULE_ID} | Running backup`);

		let { BACKUP, database, host, password, port, uri, user_name } = DB;

		database = database ? `--dbname ${database}` : '';
		host = host ? `--host ${host}` : '';
		password = password ? `export PGPASSWORD="${password}" && ` : '';
		port = port ? `--port ${port}` : '';
		user_name = user_name ? `--username ${user_name}` : '';

		const data_flags = `--schema ${BACKUP.schema} --data-only`;
		const schema_flags = '--clean --create --schema-only';
		const schema_dump_file = `${directory}/schema.syndication.${time}.sql`;
		const data_dump_file = `${directory}/data.syndication.${time}.sql`;
		const tables = BACKUP.tables
			.map(item => `--table ${BACKUP.schema}.${item}`)
			.join(' ');

		let dump_data;
		let dump_schema;

		if (uri) {
			dump_data = `${
				BACKUP.program
			} ${uri} ${data_flags} ${tables} --file ${data_dump_file}`;

			dump_schema = `${
				BACKUP.program
			} ${uri} ${schema_flags} --file ${schema_dump_file}`;
		} else {
			dump_data = `${password} ${
				BACKUP.program
			} ${database} ${host} ${port} ${user_name} ${schema_flags} --file ${schema_dump_file}`;

			dump_schema = `${password} ${
				BACKUP.program
			} ${database} ${host} ${port} ${user_name} ${data_flags} ${tables} --file ${data_dump_file}`;
		}

		await execAsync(`${dump_schema}`);

		await execAsync(`${dump_data}`);

		const archive = archiver(DOWNLOAD_ARCHIVE_EXTENSION);

		archive.on('error', err => {
			log.error(`${MODULE_ID} ArchiveError => `, {
				error: err.stack || err,
			});
		});

		archive.on('end', () => {
			log.info(`${MODULE_ID} ArchiveEnd => in ${Date.now() - START}ms`);
		});

		archive.append(createReadStream(schema_dump_file), {
			name: path.basename(schema_dump_file),
		});

		archive.append(createReadStream(data_dump_file), {
			name: path.basename(data_dump_file),
		});

		if (
			archive._state.finalize !== true &&
			archive._state.finalizing !== true
		) {
			archive.finalize();
		}

		const file = {
			archive,
			file_name: `${BACKUP.schema}.${time}.${DOWNLOAD_ARCHIVE_EXTENSION}`,
		};

		const res = await upload(file);

		log.info(`${MODULE_ID} | backup uploaded to s3`, res);

		return file;
	} catch (e) {
		log.error(`${MODULE_ID} => `, e);
	}

	rm('-rf', directory);
};

function upload({ archive, file_name }) {
	return new Promise((resolve, reject) => {
		const {
			BACKUP: { bucket },
		} = DB;

		const client = new S3UploadStream(S3);

		const mime_type = mime.lookup(DOWNLOAD_ARCHIVE_EXTENSION);

		const upload = client.upload({
			Bucket: bucket.id,
			ContentType: mime_type,
			Key: `${bucket.directory}/${file_name}`,
			ServerSideEncryption: bucket.encryption_type,
		});

		upload.on('error', err => reject(err));
		upload.on('uploaded', res => resolve(res));

		//		upload.on('part', part => console.log(part));

		archive.pipe(upload);
	});
}
