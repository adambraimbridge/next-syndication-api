const { default: log } = require('@financial-times/n-logger');

module.exports = async (req, res, next) => {
    const operation = 'erasure-search';
    const requestedBy = req.cookies.s3o_username;
    const db = res.locals.$DB;
    const { email, uuid } = req.body;
    const uuidSearchResults = [];
    const emailSearchResults = [];

    log.info({ operation, requestedBy, email, uuid });

    try {
        if (uuid) {
            const userTableResults = await db.run(`SELECT * FROM syndication.users WHERE user_id = '${uuid}';`);
            log.info({ operation, subOp: 'search-user-table-by-uuid', requestedBy, uuid, userTableResults});
            uuidSearchResults.push({ table: 'users', recordsFound: userTableResults.length });

            const migratedUserTableResults = await db.run(`SELECT * FROM syndication.migrated_users WHERE user_id = '${uuid}';`);
            log.info({ operation, subOp: 'search-migrated-user-table-by-uuid', requestedBy, uuid, migratedUserTableResults});
            uuidSearchResults.push({ table: 'migrated_users', recordsFound: migratedUserTableResults.length });
        }

        if (email) {
            const userTableResults = await db.run(`SELECT * FROM syndication.users WHERE email = '${email}';`);
            log.info({ operation, subOp: 'search-user-table-by-email', requestedBy, email, userTableResults});
            emailSearchResults.push({ table: 'users', recordsFound: userTableResults.length });
        }

        const viewModel = {
            email,
            uuid,
            uuidSearchResults,
            emailSearchResults
        };

        res.render('erasure', { viewModel });

    } catch (error) {
        next(error);
    }
};
