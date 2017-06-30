'use strict';

const { exec } = require('child_process');
const path = require('path');
const { PassThrough } = require('stream');
const util = require('util');
const url = require('url');

const { default: log } = require('@financial-times/n-logger');

const archiver = require('archiver');
const moment = require('moment');
const fetch = require('n-eager-fetch');

const { DOWNLOAD_ARCHIVE_EXTENSION } = require('config');

const convertArticle = require('./convert-article');

const execAsync = util.promisify(exec);

const MODULE_ID = path.relative(process.cwd(), module.id) || require(path.resolve('./package.json')).name;

module.exports = exports = (req, res, next) => {
	const START = Date.now();

	let headers = cloneRequestHeaders(req);

	let { __content: content } = res;

	let cancelDownload = () => req.__download_cancelled__ = true;
	req.on('abort', cancelDownload);
	req.connection.on('close', cancelDownload);

	let captionsAppended = false;
	let mediaAppended = false;
	let transcriptAppended = false;

	let archive = archiver(DOWNLOAD_ARCHIVE_EXTENSION);

	archive.on('error', err => {
		publishEndEvent(res, 'error');

		log.error(`${MODULE_ID} ArchiveError`, err.stack || err);

		res.status(500).end();
	});
	archive.on('end', () => {
		log.debug(`${MODULE_ID} #${content.id} => ${Date.now() - START}ms`);

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

				log.info(`${MODULE_ID} TranscriptAppendSuccess (${Date.now() - START}ms) => `, content);

				transcriptAppended = true;

				if (captionsAppended === true && mediaAppended === true && archive._state.finalize !== true && archive._state.finalizing !== true) {
					archive.finalize();
				}
			})
			.catch(e => {
				log.error(`${MODULE_ID} TranscriptAppendError => `, e.stack);
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

				log.info(`${MODULE_ID} CaptionAppendSuccess (${Date.now() - START}ms) => `, content);

				captionsAppended = true;

				if (mediaAppended === true && transcriptAppended === true && archive._state.finalize !== true && archive._state.finalizing !== true) {
					archive.finalize();
				}
			})
			.catch(e => {
				log.error(`${MODULE_ID} CaptionsAppendError => `, e.stack);
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

		const LENGTH = parseInt(uriRes.headers.get('content-length'), 10);

		let length = 0;
		let uriStream;

		let onend = () => {
			let state = 'complete';
			let status = 200;

			if (length < LENGTH) {
				state = 'interrupted';
				status = 400;
			}

			res.status(status);

			publishEndEvent(res, state);
		};

		stream.on('close', onend);
		stream.on('end', onend);

		log.debug(`${MODULE_ID} MediaAppendSuccess (${Date.now() - START}ms) => `, content);

		archive.append(stream, { name: `${content.fileName}.${content.download.extension}` });

		stream.on('data', (chunk) => {
			if (req.__download_cancelled__ === true) {
				uriStream.end();

				archive.end();

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
	const event = res.__event.clone({
		state,
		time: moment().toJSON()
	});

	process.nextTick(async () => await event.publish());
}
