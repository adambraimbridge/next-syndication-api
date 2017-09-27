'use strict';

const path = require('path');

const nHealthCheck = require('n-health/src/checks/check');
const nHealthStatus = require('n-health/src/checks/status');
const { default: log } = require('@financial-times/n-logger');

const pg = require('../db/pg');

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

module.exports = exports = new (class DBSyncStateCheck extends nHealthCheck {
	async tick() {
		const START = Date.now();

		this.status = nHealthStatus.PENDING;

		const db = await pg();

		const [{ get_health_contracts: contracts }] = await db.syndication.get_health_contracts([]);
		const [{ get_health_downloads: downloads }] = await db.syndication.get_health_downloads([]);
		const [{ get_health_saved_items: saved_items }] = await db.syndication.get_health_saved_items([]);

		const checkOutput = Object.assign({}, contracts, downloads, saved_items);

		const ok = check(checkOutput);

		this.checkOutput = JSON.stringify(checkOutput);

		this.status = ok === true ? nHealthStatus.PASSED : nHealthStatus.FAILED;

		log.info(`${MODULE_ID} in ${Date.now() - START}ms => ${this.checkOutput}`);

		return this.checkOutput;
	}
})({
	businessImpact: 'The Syndication database\'s computed tables are not in-sync with the base table data and, as such, may be showing incorrect data to users.',
	name: 'Syndication database data integrity',
	panicGuide: `To force a reload of all the computed tables, run:
	 
\`\`\`
    ~$ psql --username \${PRODUCTION_DATABASE_USER_NAME} 
            --password \${PRODUCTION_DATABASE_PASSWORD} 
            --host \${PRODUCTION_DATABASE_HOST} 
            --port \${PRODUCTION_DATABASE_PORT} 
            --dbname \${PRODUCTION_DATABASE_NAME}  
            --command 'select syndication.reload_all();'
\`\`\`
  
Substituting the above \`\${PRODUCTION_DATABASE_*}\` placeholders with the correct values from vault.`,
	severity: 3,
	technicalSummary: 'Checks the Syndication database\'s computed tables are correctly representing the base tables\' data.'
});

if (process.env.NODE_ENV !== 'test') {
	exports.start();
}

function check(item) {
	for (let [, val] of Object.entries(item)) {
		if (val > 0) {
			return false;
		}
	}

	return true;
}
