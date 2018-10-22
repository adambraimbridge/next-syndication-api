'use strict';

const path = require('path');

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const proxyquire = require('proxyquire');

const AWS = require('aws-sdk');

const enrich = require('../../../../server/lib/enrich');

const {
	TEST: { FIXTURES_DIRECTORY },
} = require('config');

const { expect } = chai;
chai.use(sinonChai);

const __proto__ = Object.getPrototypeOf(new AWS.S3({}));

const MODULE_ID =
	path.relative(`${process.cwd()}/test`, module.id) ||
	require(path.resolve('./package.json')).name;

describe(MODULE_ID, function() {
	let underTest;
	let S3Object;
	let S3Promise;
	let S3Stub;
	let content;
	let db;
	let getContentStub;
	let subscriber;

	const { initDB } = require(path.resolve(`${FIXTURES_DIRECTORY}/massive`))();

	afterEach(function() {
		S3Stub.restore();
	});

	beforeEach(function() {
		db = initDB();

		db.syndication.upsert_content_es.resolves([]);
		db.syndication.delete_content_es.resolves([]);

		subscriber = {
			ack: sinon.stub(),
		};

		S3Object = require(path.resolve(
			`${FIXTURES_DIRECTORY}/translations/b6e54ea4-86c4-11e7-8bb1-5ba57d47eff7.json`
		));
		S3Promise = {
			promise: () =>
				Promise.resolve({
					Body: Buffer.from(JSON.stringify(S3Object), 'utf8'),
				}),
		};
		S3Stub = sinon.stub(__proto__, 'getObject').callsFake(() => S3Promise);

		content = require(path.resolve(
			`${FIXTURES_DIRECTORY}/content/b6e54ea4-86c4-11e7-8bb1-5ba57d47eff7.json`
		));
		getContentStub = sinon.stub().resolves(content);

		underTest = proxyquire(
			'../../../../worker/sync/content-es/upsert-content',
			{
				'@financial-times/n-logger': {
					default: {
						error: () => {},
						info: () => {},
						warn: () => {},
					},
				},
				'../../../db/pg': sinon.stub().resolves(db),
				'../../../server/lib/get-content-by-id': getContentStub,
			}
		);
	});

	describe('S3 `ObjectDelete:*`', function() {
		it('flags the item as `deleted` in the DB', async function() {
			const event = require(path.resolve(
				`${FIXTURES_DIRECTORY}/s3-events/b6e54ea4-86c4-11e7-8bb1-5ba57d47eff7.delete.json`
			));
			const message = { data: event };

			await underTest(event, message, {}, subscriber);

			expect(db.syndication.delete_content_es).to.have.been.calledWith([
				event.Records[0].s3.object.key,
			]);
		});
	});

	describe('S3 `ObjectCreated:*`', function() {
		it('retrieves the correct file from the S3 bucket', async function() {
			const event = require(path.resolve(
				`${FIXTURES_DIRECTORY}/s3-events/b6e54ea4-86c4-11e7-8bb1-5ba57d47eff7.create.json`
			));
			const message = { data: event };

			await underTest(event, message, {}, subscriber);

			expect(S3Stub).to.have.been.calledWith({
				Bucket: event.Records[0].s3.bucket.name,
				Key: event.Records[0].s3.object.key,
			});
		});

		it('retrieves the content from elastic search', async function() {
			const event = require(path.resolve(
				`${FIXTURES_DIRECTORY}/s3-events/b6e54ea4-86c4-11e7-8bb1-5ba57d47eff7.create.json`
			));
			const message = { data: event };

			await underTest(event, message, {}, subscriber);

			expect(getContentStub).to.have.been.calledWith(
				event.Records[0].s3.object.key
			);
		});

		it('adds maps the properties to their corresponding DB column names and persists it to the DB', async function() {
			const event = require(path.resolve(
				`${FIXTURES_DIRECTORY}/s3-events/b6e54ea4-86c4-11e7-8bb1-5ba57d47eff7.create.json`
			));
			const message = { data: event };

			await underTest(event, message, {}, subscriber);

			S3Object.body = S3Object.bodyHTML;
			S3Object.content_area =
				S3Object.isWeekendContent === true
					? 'Spanish weekend'
					: 'Spanish content';
			S3Object.content_id = S3Object.id = S3Object.uuid;
			S3Object.content_type = 'article';
			S3Object.state = 'created';
			S3Object.translated_date = S3Object.translatedDate;

			enrich(S3Object);

			delete S3Object.document;

			S3Object.word_count = S3Object.wordCount;

			S3Object.published_date = new Date(
				content.firstPublishedDate || content.publishedDate
			);

			expect(db.syndication.upsert_content_es).to.have.been.calledWith([
				S3Object,
			]);
		});
	});
});
