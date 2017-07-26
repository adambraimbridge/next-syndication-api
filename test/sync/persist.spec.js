'use strict';

const path = require('path');

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

const {
} = require('config');

const HistorySchema = require('../../db/table_schemas/history');
const { db } = require('../../db/connect');
const toPutItem = require('../../db/toPutItem');

const MessageQueueEvent = require('../../queue/message-queue-event');

const underTest = require('../../sync/persist');

const { expect } = chai;
chai.use(sinonChai);

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe(MODULE_ID, function () {
	afterEach(function () {
		db.putItemAsync.restore();
	});

	beforeEach(function () {
		sinon.stub(db, 'putItemAsync').resolves({});
	});

	it('converts an SQS event into a DynamoDB friendly format and persits it', async function () {
		const event = (new MessageQueueEvent({
			event: {
				content_id: 'http://www.ft.com/thing/abc',
				contract_id: 'syndication',
				download_format: 'docx',
				licence_id: 'foo',
				state: 'save',
				time: new Date(),
				user: {
					email: 'foo@bar.com',
					firstName: 'foo',
					id: 'abc',
					lastName: 'bar'
				}
			}
		})).toJSON();

		await underTest(event);

		expect(db.putItemAsync).to.be.calledWith(toPutItem(event, HistorySchema));
	});
});
