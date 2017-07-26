'use strict';

const path = require('path');

const { expect } = require('chai');

const {
	TEST: { FIXTURES_DIRECTORY }
} = require('config');

const underTest = require('../../db/toPutItem');

const ContractsSchema = require('../../db/table_schemas/contracts');
const HistorySchema = require('../../db/table_schemas/history');

const MessageQueueEvent = require('../../queue/message-queue-event');

const contractFixture = require(path.resolve(`${FIXTURES_DIRECTORY}/contractProfile.json`));

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe(MODULE_ID, function () {
	describe('Contracts', function () {
		it('returns an Object in a DynamodB friendly format', function () {
			let item = underTest(contractFixture, ContractsSchema);

			expect(item).to.eql({
				TableName: ContractsSchema.TableName,
				Item: {
					contract_number: { S: contractFixture.contractNumber },
					contract_ends: { S: contractFixture.endDate },
					contract_starts: { S: contractFixture.startDate },
					contributor_content: { BOOL: contractFixture.contributor },
					client_publications: { S: contractFixture.clientPublications },
					client_website: { S: contractFixture.clientWebsite },
					licencee_name: { S: contractFixture.licenceeName },
					limit_article: { N: String(contractFixture.articleLimit) },
					limit_podcast: { N: String(contractFixture.podcastLimit) },
					limit_video: { N: String(contractFixture.videoLimit) },
					owner_name: { S: contractFixture.ownerName },
					owner_email: { S: contractFixture.ownerEmail },
					assets: {
						L: contractFixture.assets.map(item => {
							return { M: {
								product: { S: item.productName },
								print_usage_period: { S: item.maxPermittedPrintUsagePeriod },
								print_usage_limit: { N: String(item.maxPermittedPrintUsage) },
								online_usage_period: { S: item.maxPermittedOnlineUsagePeriod },
								online_usage_limit: { N: String(item.maxPermittedOnlineUsage) },
								embargo_period: { N: String(item.embargoPeriod) },
								content: { S: item.contentSet },
								asset: { S: item.assetName }
							} };
						})
					}
				}
			});
		});
	});

	describe('History', function () {
		it('returns an Object in a DynamodB friendly format', function () {
			let event = (new MessageQueueEvent({ event: {
				content_id: 'http://www.ft.com/thing/abc',
				contract_id: 'syndication',
				download_format: 'docx',
				licence_id: 'foo',
				state: 'save',
				time: new Date(),
				user: {
					email: 'foo@bar.com',
					first_name: 'foo',
					id: 'bar',
					surname: 'bar'
				}
			}})).toJSON();
			let item = underTest(event, HistorySchema);

			expect(item).to.eql({
				TableName: HistorySchema.TableName,
				Item: {
					_id: { S: event._id },
					content_id: { S: event.content_id },
					contract_id: { S: event.contract_id },
					contributor_content: { BOOL: event.contributor_content },
					download_format: { S: event.download_format },
					item_state: { S: event.state },
					licence_id: { S: event.licence_id },
					syndication_state: { S: event.syndication_state },
					time: { S: event.time },
					user: {
						M: {
							email: { S: event.user.email },
							first_name: { S: event.user.first_name },
							id: { S: event.user.id },
							surname: { S: event.user.surname }
						}
					},
					version: { S: event.version }
				}
			});
		});
	});
});
