'use strict';

const path = require('path');

const { default: log } = require('@financial-times/n-logger');

const AWS = require('aws-sdk');

const pg = require('../../../db/pg');

const {
	AWS_ACCESS_KEY,
	AWS_REGION = 'eu-west-1',
	AWS_SECRET_ACCESS_KEY
} = require('config');

const S3 = new AWS.S3({
	accessKeyId: AWS_ACCESS_KEY,
	region: AWS_REGION,
	secretAccessKey: AWS_SECRET_ACCESS_KEY
});

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

module.exports = exports = async (event, message, response, subscriber) => {
	try {
		log.info(`${MODULE_ID} RECEIVED => `, event);

		const db = await pg();

		if (!Array.isArray(event.Records)) {
			log.warn(`${MODULE_ID} SKIPPING => `, JSON.stringify(event, null, 4));

			return;
		}

		const { Records: [ {
			eventName,
			s3: {
				bucket: {
					name: BUCKET_NAME
				},
				object: {
					key: FILE_NAME
				}
			}
		} ] } = event;

		const CONTENT_STATE = String(eventName).toLowerCase().includes('create') ? 'created': 'deleted';

		switch (CONTENT_STATE) {
			case 'created':
				const res = await (S3.getObject({
					Bucket: BUCKET_NAME,
					Key: FILE_NAME
				}).promise());

				const item = JSON.parse(res.Body.toString('utf8'));

				item.body = item.bodyHTML;
				item.content_area = item.isWeekendContent === true ? 'Spanish weekend' : 'Spanish content';
				item.content_id = item.uuid;
				item.content_type = 'article';
				item.state = CONTENT_STATE;
				item.translated_date = item.translatedDate;

				await db.syndication.upsert_content_es([item]);

				log.info(`${MODULE_ID} UPSERTING => `, JSON.stringify(item, null, 4));

				break;
			case 'deleted':
				await db.syndication.delete_content_es([path.basename(FILE_NAME, path.extname(FILE_NAME))]);

				log.info(`${MODULE_ID} DELETING => ${path.basename(FILE_NAME, path.extname(FILE_NAME))}`);

				break;
		}

		await subscriber.ack(message);
	}
	catch (e) {
		log.error(`${MODULE_ID} => `, e);
	}
};