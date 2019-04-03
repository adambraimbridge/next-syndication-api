'use strict';

const path = require('path');

const log = require('../../../server/lib/logger');

const AWS = require('aws-sdk');
const Slack = require('node-slack');

const pg = require('../../../db/pg');
const enrich = require('../../../server/lib/enrich');
const getContentById = require('../../../server/lib/get-content-by-id');

const {
	AWS_ACCESS_KEY,
	AWS_SECRET_ACCESS_KEY,
	SLACK: {
		INCOMING_HOOK_URL_T9N: SLACK_INCOMING_HOOK_URL_T9N
	}
} = require('config');

const S3 = new AWS.S3({
	accessKeyId: AWS_ACCESS_KEY,
	region: 'eu-west-1',
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
				item.content_id = item.id = item.uuid;
				item.content_type = item.type = 'article';
				item.state = CONTENT_STATE;
				item.translated_date = item.translatedDate;

				enrich(item);

				delete item.document;

				item.word_count = item.wordCount;

				try {
					const item_en = await getContentById(item.content_id);

					if (!item_en) {
						await notifyError({
							error: { message: `ElasticSearch could not find content with ID: ${item.content_id}` },
							file: FILE_NAME
						});
					}
					else {
						item.published_date = new Date(item_en.firstPublishedDate || item_en.publishedDate);

						await db.syndication.upsert_content_es([item]);

						log.info(`${MODULE_ID} UPSERTING => `, JSON.stringify(item, null, 4));
					}
				}
				catch (error) {
					await notifyError({ error, file: FILE_NAME });
				}

				break;
			case 'deleted':
				await db.syndication.delete_content_es([path.basename(FILE_NAME, path.extname(FILE_NAME))]);

				log.info(`${MODULE_ID} DELETING => ${path.basename(FILE_NAME, path.extname(FILE_NAME))}`);

				break;
		}

		if (process.env.NODE_ENV === 'production') {
			await subscriber.ack(message);
		}
	}
	catch (e) {
		log.error(`${MODULE_ID} => `, e);
	}
};

async function notifyError ({ error, file }) {
	const slack = new Slack(SLACK_INCOMING_HOOK_URL_T9N);

	const message = {
		mrkdwn: true,
		text: `Error with file: *${file}*
\`\`\`
`
	};

	if (Object.prototype.toString.call(error) !== '[object String]') {
		if (error instanceof Error) {
			message.text += JSON.stringify(error.stack, null, 2);
		}
		else {
			message.text += JSON.stringify(error, null, 2);
		}
	}
	else {
		message.text += error;
	}

	message.text += '\n```';

	return slack.send(message);
}
