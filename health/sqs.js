'use strict';

const { writeFile } = require('fs');
const path = require('path');
const util = require('util');

const moment = require('moment');
const { mkdir, ls, rm } = require('shelljs');

const nHealthCheck = require('n-health/src/checks/check');
const nHealthStatus = require('n-health/src/checks/status');
const { default: log } = require('@financial-times/n-logger');

const {
	HEALTH_CHECK_HISTORY,
	SYNDICATION_DOWNLOAD_SQS_URL: DEFAULT_QUEUE_URL
} = require('config');

const sqs = require('../queue/connect');

const writeFileAsync = util.promisify(writeFile);

const BLOATED_THRESHOLD = HEALTH_CHECK_HISTORY.bloated_threshold;

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

const HISTORY_DIRECTORY = path.resolve(HEALTH_CHECK_HISTORY.directory, 'sqs');

module.exports = exports = new (class SQSCheck extends nHealthCheck {
	getHistory() {
		mkdir('-p', HISTORY_DIRECTORY);

		let results = ls(HISTORY_DIRECTORY);

		if (results.length > HEALTH_CHECK_HISTORY.max_items) {
			const clear = results.splice(0, results.length - HEALTH_CHECK_HISTORY.max_items);

			clear.forEach(file => rm('-f', path.resolve(HISTORY_DIRECTORY, file)));
		}

		results = results.map(file => {
			return require(path.resolve(HISTORY_DIRECTORY, file));
		});

		return results;
	}

	async tick() {
		const START = Date.now();

		this.status = nHealthStatus.PENDING;

		let results = this.getHistory();

		const AttrValues = [
			'ApproximateNumberOfMessages',
			'ApproximateNumberOfMessagesDelayed'
		];

		const { Attributes } = await sqs.getQueueAttributesAsync({
			AttributeNames: AttrValues,
			QueueUrl: DEFAULT_QUEUE_URL
		});

		Attributes.total = 0;

		AttrValues.forEach(item => {
			Attributes[item] = parseInt(Attributes[item], 10);
			Attributes.total += Attributes[item];
		});
		// this will write lots of files to your hard drive and make the app constantly restart with nodemon if run locally
		if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test') {
			await writeFileAsync(path.resolve(HISTORY_DIRECTORY, moment().format(HEALTH_CHECK_HISTORY.file_date_format)), JSON.stringify(Attributes, null, 4), 'utf8');
		}

		results.push(Attributes);

		results = results.length <= HEALTH_CHECK_HISTORY.max_items ? results : results.slice(results.length - HEALTH_CHECK_HISTORY.max_items);

		const checkOutput = results.reduce((acc, item, index) => {
			if (index > 0) {
				const delta = item.total - results[index - 1].total;

				const prevDelta = acc[index - 1] ? acc[index - 1].delta : 0;

				acc.push({
					delta,
					state: (delta > prevDelta ? 1 : delta < prevDelta ? -1 : 0),
					total: item.total
				});
			}

			return acc;
		}, []);

		let final = null;

		checkOutput.forEach(item => {
			const { delta, state, total } = item;

			if (state < 1) {
				if (delta === 0) {
					final = null;
				}
			}
			else if (delta > 0 || total > BLOATED_THRESHOLD) {
				final = item;
			}
			else {
				final = null;
			}
		});

		let ok = true;

		if (final !== null) {
			ok = false;
		}

		this.checkOutput = JSON.stringify(checkOutput);

		this.status = ok === true ? nHealthStatus.PASSED : nHealthStatus.FAILED;

		log.info(`${MODULE_ID} in ${Date.now() - START}ms => ${this.checkOutput}`);

		return this.checkOutput;
	}
})({
	businessImpact: 'Saved and downloaded items are not currently being processed by the Syndication API and, as such, are backing up in the Syndication SQS Queue.',
	name: 'Syndication SQS Queue message processing',
/*eslint-disable*/
	panicGuide: `1. check SQS Queue (next-syndication-downloads-prod) on Infra Prod.
2. check/tail the server/worker logs on Heroku:

	\`\`\`
		~$ heroku logs --app ft-next-syndication-api --tail --num 100
	\`\`\`

	— the queue is processed by the \`sync\` worker: \`app[sync.\${N}]\` — see if there are any errors and/or if a specific queue message is failing/erroring repeatedly.
3. find the message in the SQS queue, copy the message body somewhere safe and remove it from the queue.
4. check the queue is now being processed correctly and repeat steps 2 & 3 until it is.
5. publish the failing/erroring message(s) into the developmewnt SQS Queue (next-syndication-downloads-dev) on Infra Prod to so you can replicate and fix the issue.
6. once the issue has been fixed, if it makes sense to — e.g. a download needs to be recorded — republish the failing/erroring message(s) to te production queue for processing.`,
/*eslint-enable*/
	severity: 2,
	technicalSummary: 'Checks if messages on the Syndication SQS Queue are being processed or if they are backing up.'
});

if (process.env.NODE_ENV !== 'test') {
	exports.start();
}
