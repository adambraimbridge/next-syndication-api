const { default: log } = require('@financial-times/n-logger');
const operation = 'erasure-search';

async function searchUserTableByUuid (db, uuid, requestedBy) {
	try {
		const userTableResults = await db.run('SELECT * FROM syndication.users WHERE user_id = $1;', [uuid]);
		log.info({ operation, subOp: 'search-user-table-by-uuid', requestedBy, uuid, userTableResults});
		return { uuid, table: 'users', recordsFound: userTableResults.length };
	} catch (error) {
		throw error;
	}
}

async function searchUserTableByEmail (db, email, requestedBy) {
	try {
		const userTableResults = await db.run('SELECT * FROM syndication.users WHERE email = $1;', [email]);
		log.info({ operation, subOp: 'search-user-table-by-email', requestedBy, email, userTableResults});
		return { email, table: 'users', recordsFound: userTableResults.length };
	} catch (error) {
		throw error;
	}
}

async function searchMigratedUsersTableByUuid (db, uuid, requestedBy) {
	try {
		const migratedUserTableResults = await db.run('SELECT * FROM syndication.migrated_users WHERE user_id = $1;', [uuid]);
		log.info({ operation, subOp: 'search-migrated-user-table-by-uuid', requestedBy, uuid, migratedUserTableResults});
		return { uuid, table: 'migrated_users', recordsFound: migratedUserTableResults.length };
	} catch (error) {
		throw error;
	}
}

function getInvalidUuids (uuids) {
	return uuids.filter(uuid => !/[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}/.test(uuid));
}

function getInvalidEmails (emails) {
	return emails.filter(email => !/[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,64}/.test(email));
}

module.exports = async (req, res, next) => {
	const requestedBy = req.cookies.s3o_username;
	const db = res.locals.$DB;
	const { erasureEmails, erasureUuids } = req.body;

	log.info({ operation, requestedBy, erasureEmails, erasureUuids });

	try {
		const uuids = erasureUuids === '' ? [] : erasureUuids.split(/\r?\n/);
		const emails = erasureEmails === '' ? [] : erasureEmails.split(/\r?\n/);
		const invalidUuids = getInvalidUuids(uuids);
		const invalidEmails = getInvalidEmails(emails);

		if (invalidEmails.length > 0 || invalidUuids.length > 0) {
			const viewModel = {
				uuids,
				emails,
				erasureEmails,
				erasureUuids,
				invalidEmails,
				invalidUuids
			};

			res.render('erasure', { viewModel });

		} else {
			const uuidSearchResults = [];
			const emailSearchResults = [];

			if (erasureUuids) {
				await Promise.all(uuids.map(async (uuid) => {
					const userTableResults = await searchUserTableByUuid(db, uuid, requestedBy);
					const migratedUserTableResults = await searchMigratedUsersTableByUuid(db, uuid, requestedBy);
					uuidSearchResults.push(userTableResults, migratedUserTableResults);
				}));
			}

			if (erasureEmails) {
				await Promise.all(emails.map(async (email) => {
					const userTableResults = await searchUserTableByEmail(db, email, requestedBy);
					emailSearchResults.push(userTableResults);
				}));
			}

			const viewModel = {
				uuidSearchResults,
				emailSearchResults
			};

			res.render('erasure-search-results', { viewModel });
		}

	} catch (error) {
		next(error);
	}
};
