'use strict';

const { exec } = require('child_process');
const path = require('path');
const { PassThrough } = require('stream');
const util = require('util');
const url = require('url');

const log = require('./logger');

const archiver = require('archiver');
const fetch = require('n-eager-fetch');

const { DOWNLOAD_ARCHIVE_EXTENSION } = require('config');

const convertArticle = require('./convert-article');

const execAsync = util.promisify(exec);

module.exports = exports = (req, res, next) => {
	const START = Date.now();

	let headers = cloneRequestHeaders(req);

	let { __content: content } = res;

	let captionsAppended = false;
	let mediaAppended = false;
	let transcriptAppended = false;

	let archive = archiver(DOWNLOAD_ARCHIVE_EXTENSION);

	archive.on('error', error => {
		publishEndEvent(res, 'error');

		log.error({
			error,
			contentId: content.id
		});

		res.status(500).end();
	});
	archive.on('end', () => {
		log.debug(`ArchiveEnd => ${content.id} in ${Date.now() - START}ms`);

		if (req.__download_cancelled__ !== true) {
			req.__download_successful__ = true;

			res.end();

			next();
		}
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

			log.debug(`TranscriptAppendSuccess => ${content.id} in ${Date.now() - START}ms`);

			transcriptAppended = true;

			if (captionsAppended === true && mediaAppended === true && archive._state.finalize !== true && archive._state.finalizing !== true) {
				archive.finalize();
			}
		})
		.catch(error => {
			log.error({
				event: 'TRANSCRIPT_APPEND_ERROR',
				error,
				contentId: content.id
			});
		});
	}
	else {
		transcriptAppended = true;
	}

	if (Array.isArray(content.captions) && content.captions.length) {
		Promise
			.all(content.captions.map(({ url: uri }) => execAsync(`curl ${uri}`)))
			.then(all => {
				all.forEach(({ stdout }, i) => {
					let name = path.basename(url.parse(content.captions[i].url).pathname);

					archive.append(stdout, { name });
				});

				log.debug(`CaptionAppendSuccess => ${content.id} in ${Date.now() - START}ms`);

				captionsAppended = true;

				if (mediaAppended === true && transcriptAppended === true && archive._state.finalize !== true && archive._state.finalizing !== true) {
					archive.finalize();
				}
			})
			.catch(error => {
				log.error({
					event: 'CAPTIONS_APPEND_ERROR',
					error,
					contentId: content.id
				});
			});
	}
	else {
		captionsAppended = true;
	}

	const URI = content.download.binaryUrl;

	fetch(URI, { method: 'HEAD', headers: headers }).then((uriRes) => {
		const stream = new PassThrough();

		if (!uriRes.ok) {
			res.status(uriRes.status).end();

			return next();
		}

		let cancelDownload = () => {
			if (req.__download_successful__ === true) {
				return;
			}

			req.__download_cancelled__ = true;

			if (req.__end_called__ !== true) {
				!uriStream || uriStream.end();

				archive.end();

				onend();

				req.__end_called__ = true;

				next();
			}
		};

		req.on('abort', cancelDownload);
		req.connection.on('close', cancelDownload);

		const LENGTH = parseInt(uriRes.headers.get('content-length'), 10);

		let length = 0;
		let uriStream;

		let onend = () => {
			if (req.__end_called__ !== true) {
				let state = 'complete';
				let status = 200;

				if (length < LENGTH || req.__download_cancelled__ === true) {
					state = 'interrupted';
					status = 400;
				}

				res.status(status);

				publishEndEvent(res, state);
			}
		};

		stream.on('error', onend);
		stream.on('close', onend);
		stream.on('end', onend);

		log.debug(`MediaAppendSuccess => ${content.id} in ${Date.now() - START}ms`);

		archive.append(stream, { name: `${content.fileName}.${content.download.extension}` });

		stream.on('data', (chunk) => {
			if (req.__download_cancelled__ === true) {
				if (req.__end_called__ !== true) {
					uriStream.end();

					archive.end();

					onend();

					req.__end_called__ = true;
				}

				return;
			}

			mediaAppended = true;

			if (captionsAppended === true && transcriptAppended === true && archive._state.finalize !== true && archive._state.finalizing !== true) {
				archive.finalize();
			}

			length += chunk.length;
		});

		fetch(URI, { headers: headers }).then((uriRes) => {
			if (req.__download_cancelled__ === true) {
				archive.end();

				return;
			}

			process.nextTick(async () => await res.locals.__event.publish());

			uriRes.body.pipe(stream);

			uriStream = uriRes.body;
		});
	});
};

function cloneRequestHeaders(req) {
	let headers = JSON.parse(JSON.stringify(req.headers));

	['accept', 'host'].forEach(name => delete headers[name]);

	Object.keys(headers).forEach(name => headers[name] !== '-' || delete headers[name]);

	return headers;
}

function publishEndEvent(res, state) {
	// don't fire twice
	if (res.locals.__eventEnd) {
		return;
	}

	res.locals.__eventEnd = res.locals.__event.clone({
		state
	});

	process.nextTick(async () => await res.locals.__eventEnd.publish());
}
