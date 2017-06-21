'use strict';

const path = require('path');
const { PassThrough } = require('stream');

const { default: log } = require('@financial-times/n-logger');

const archiver = require('archiver');
const moment = require('moment');
const fetch = require('n-eager-fetch');

const { DOWNLOAD_ARCHIVE_EXTENSION } = require('config');

const convertArticle = require('./convert-article');

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

module.exports = exports = (content, req, res, next) => {
	let cancelDownload = () => req.__download_cancelled__ = true;
	req.on('abort', cancelDownload);
	req.connection.on('close', cancelDownload);

	let mediaAppended = false;
	let transcriptAppended = false;

	let archive = archiver(DOWNLOAD_ARCHIVE_EXTENSION);

	archive.on('error', err => {
		publishEndEvent(res, 'error');

		log.error(`${MODULE_ID} ArchiveError`, err.stack || err);

		res.status(500).end();
	});
	archive.on('end', () => {
		res.end();

		next();
	});

	archive.pipe(res);

	if (content.transcript) {
		convertArticle({
			source: content[content.extension === 'plain' ? 'transcript__PLAIN' : 'transcript__CLEAN'],
			sourceFormat: 'html',
			targetFormat: content.transcriptExtension
		})
		.then(file => {
			archive.append(file, { name: `${content.fileName}.${content.transcriptExtension}` });

			log.info(`${MODULE_ID} TranscriptAppendSuccess => `, content);

			transcriptAppended = true;

			if (mediaAppended === true && archive._state.finalize !== true && archive._state.finalizing !== true) {
				archive.finalize();
			}
		})
		.catch(e => {
			log.error(`${MODULE_ID} TranscriptAppendError => `, e);
		});
	}
	else {
		transcriptAppended = true;
	}

	const URI = content.download.binaryUrl;

	fetch(URI, { method: 'HEAD' }).then((uriRes) => {
		const stream = new PassThrough();

		if (!uriRes.ok) {
			res.status(uriRes.status).end();

			return next();
		}

		const LENGTH = parseInt(uriRes.headers.get('content-length'), 10);

		let length = 0;
		let uriStream;

		let onend = () => {
			let state = 'complete';

			if (length < LENGTH) {
				res.status(400);
			}
			else {
				state = 'interrupted';

				res.status(200);
			}

			publishEndEvent(res, state);
		};

		stream.on('close', onend);
		stream.on('end', onend);

		archive.append(stream, { name: `${content.fileName}.${content.download.extension}` });

		stream.on('data', (chunk) => {
			if (req.__download_cancelled__ === true) {
				uriStream.end();

				return;
			}

			mediaAppended = true;
			if (transcriptAppended === true && archive._state.finalize !== true && archive._state.finalizing !== true) {
				archive.finalize();
			}

			length += chunk.length;
		});

		let headers = Object.assign({}, req.headers);

		['accept', 'host'].forEach(name => delete headers[name]);

		Object.keys(headers).forEach(name => headers[name] !== '-' || delete headers[name]);

		fetch(URI, { headers: headers }).then((uriRes) => {
			uriRes.body.pipe(stream);

			uriStream = uriRes.body;
		});
	});
};

function publishEndEvent (res, state) {
	const event = res.__event.clone();
	event.state = state;
	event.time = moment().toJSON();

	(async () => await event.publish())();
}