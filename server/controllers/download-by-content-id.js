'use strict';

const log = require('../lib/logger');

const getContentById = require('../lib/get-content-by-id');
const prepareDownloadResponse = require('../lib/prepare-download-response');

const download = require('../lib/download');

const {
	DEFAULT_DOWNLOAD_FORMAT,
	DEFAULT_DOWNLOAD_LANGUAGE
} = require('config');

module.exports = exports = async (req, res, next) => {
	const {
		contract,
		licence,
		user
	} = res.locals;

	const { download_format } = user;

	const format = req.query.format
				|| download_format
				|| DEFAULT_DOWNLOAD_FORMAT;


	const referrer = String(req.get('referrer'));

	const lang = String(req.query.lang || (referrer.includes('/republishing/spanish') ? 'es' : DEFAULT_DOWNLOAD_LANGUAGE)).toLowerCase();

	const content = await getContentById(req.params.content_id, format, lang);

	if (Object.prototype.toString.call(content) !== '[object Object]') {

		res.sendStatus(404);

		return;
	}

	const dl = download({
		content,
		contract: contract,
		lang,
		licence: licence,
		req,
		user: user
	});

	res.locals.content = content;
	res.locals.download = dl;

	req.on('abort', () => dl.cancel());
	req.connection.on('close', () => dl.cancel());

	prepareDownloadResponse(res, content);

	if (dl.downloadAsArchive) {
		dl.on('error', (err, httpStatus) => {
			log.error({
				event: 'DOWNLOAD_ARCHIVE_ERROR',
				error: err.stack || err
			});

			res.status(httpStatus || 500).end();
		});

		dl.on('end', () => {
			log.debug(`DownloadArchiveEnd => ${content.id} in ${Date.now() - dl.START}ms`);

			if (dl.cancelled !== true) {
				res.end();

				next();
			}
		});

		dl.on('complete', (state, status) => {
			res.status(status);
		});

		dl.on('cancelled', () => {
			next();
		});

		dl.pipe(res);

		await dl.appendAll();
	}
	else {
		const file = await dl.convertArticle();

		res.set('content-length', file.length);

		res.status(200).send(file);

		dl.complete('complete');

		next();
	}
};
