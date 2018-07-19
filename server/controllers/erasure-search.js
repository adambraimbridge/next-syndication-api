const { default: log } = require('@financial-times/n-logger');
const operation = 'erasure-search';

async function searchUserTableByUuid (db, uuid, requestedBy) {
	try {
		const userTableResults = await db.run(`SELECT * FROM syndication.users WHERE user_id = '${uuid}';`);
		log.info({ operation, subOp: 'search-user-table-by-uuid', requestedBy, uuid, userTableResults});
		return { uuid, table: 'users', recordsFound: userTableResults.length };
	} catch (error) {
		throw error;
	}
}

async function searchUserTableByEmail (db, email, requestedBy) {
	try {
		const userTableResults = await db.run(`SELECT * FROM syndication.users WHERE email = '${email}';`);
		log.info({ operation, subOp: 'search-user-table-by-email', requestedBy, email, userTableResults});
		return { email, table: 'users', recordsFound: userTableResults.length };
	} catch (error) {
		throw error;
	}
}

async function searchMigratedUsersTableByUuid (db, uuid, requestedBy) {
	try {
		const migratedUserTableResults = await db.run(`SELECT * FROM syndication.migrated_users WHERE user_id = '${uuid}';`);
		log.info({ operation, subOp: 'search-migrated-user-table-by-uuid', requestedBy, uuid, migratedUserTableResults});
		return { uuid, table: 'migrated_users', recordsFound: migratedUserTableResults.length };
	} catch (error) {
		throw error;
	}
}

module.exports = async (req, res, next) => {
	const requestedBy = req.cookies.s3o_username;
	const db = res.locals.$DB;
	const { email, uuid } = req.body;
	const uuidSearchResults = [];
	const emailSearchResults = [];

	log.info({ operation, requestedBy, email, uuid });

	try {
		if (uuid) {
			const uuids = uuid.split(/\r?\n/);
			await Promise.all(uuids.map(async (uuid) => {
				const userTableResults = await searchUserTableByUuid(db, uuid, requestedBy);
				const migratedUserTableResults = await searchMigratedUsersTableByUuid(db, uuid, requestedBy);
				uuidSearchResults.push(userTableResults, migratedUserTableResults);
			}));
		}

		if (email) {
			const emails = email.split(/\r?\n/);
			await Promise.all(emails.map(async (email) => {
				const userTableResults = await searchUserTableByEmail(db, email, requestedBy);
				emailSearchResults.push(userTableResults);
			}));
		}

		const viewModel = {
			uuidSearchResults,
			emailSearchResults
		};

		res.render('erasure', { viewModel });

	} catch (error) {
		next(error);
	}
};
