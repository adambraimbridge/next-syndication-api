'use strict';

const path = require('path');

const chai = require('chai');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

const AWS = require('aws-sdk');
const moment = require('moment');

const nHealthStatus = require('n-health/src/checks/status');

const {
	DB
} = require('config');

const { expect } = chai;

chai.use(sinonChai);

const __proto__ = Object.getPrototypeOf(new AWS.S3({}));

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe(MODULE_ID, function () {
	let S3Stub;
	let underTest;
	let time;

	before(function () {
		time = moment().isSameOrAfter(moment().startOf('hour').add(10, 'minutes')) ? moment() : moment().subtract(1, 'hour');

		S3Stub = sinon.stub(__proto__, 'listObjectsV2').callsFake((params, cb) => cb(null, {
			IsTruncated: false,
			Contents: [ {
				Key: `production/syndication.${time.format(DB.BACKUP.date_format)}.zip`,
				LastModified: time.toJSON(),
				ETag: '"167e9de0f286d5d771a89b864c053ea8-1"',
				Size: 95089,
				StorageClass: 'STANDARD'
			} ],
			Name: 'next-syndication-db-backups',
			Prefix: `production/syndication.${time.format(DB.BACKUP.date_format)}`,
			MaxKeys: 5,
			CommonPrefixes: [],
			KeyCount: 1
		}));

		underTest = proxyquire('../../health/db-backups', {
			moment: moment
		});
	});

	after(function () {
		S3Stub.restore();
	});

	describe('#tick', function () {
		it('calls S3.listObectsV2 to try and find the last back up file', async function () {
			await underTest.tick();

			expect(S3Stub).to.have.been.calledWith({
				Bucket: DB.BACKUP.bucket.id,
				MaxKeys: 5,
				Prefix: `${DB.BACKUP.bucket.directory}/${DB.BACKUP.schema}.${time.format(DB.BACKUP.date_format)}`
			});
		});

		it('sets the status to PASSED if a backup file is found', async function () {
			await underTest.tick();

			expect(underTest.status).to.equal(nHealthStatus.PASSED);
		});
	});
});
