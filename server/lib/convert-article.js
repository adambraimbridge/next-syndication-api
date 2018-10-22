'use strict';

const { spawn } = require('child_process');
const path = require('path');

const { default: log } = require('@financial-times/n-logger');

const { CONVERT_FORMAT_COMMAND } = require('config');

const MODULE_ID =
	path.relative(process.cwd(), module.id) ||
	require(path.resolve('./package.json')).name;

module.exports = exports = ({
	source,
	sourceFormat = 'html',
	targetFormat = 'docx',
}) => {
	const sourceBuffer = Buffer.from(source, 'utf8');

	let args = ['--from', sourceFormat, '--to', targetFormat];

	if (targetFormat === 'plain') {
		args.push('--wrap', 'none');
	}

	return new Promise((resolve, reject) => {
		let cmd = spawn(CONVERT_FORMAT_COMMAND, args);

		let targetBuffer = Buffer.from('', 'utf8');
		let error = '';

		cmd.on('error', err => {
			log.error(`${MODULE_ID} ${CONVERT_FORMAT_COMMAND} ConversionError`, {
				error: err.stack,
			});

			reject(err);
		});

		cmd.stdout.on(
			'data',
			chunk => (targetBuffer = Buffer.concat([targetBuffer, chunk]))
		);

		cmd.stderr.on('data', chunk => (error += chunk));

		cmd.on('close', code => {
			if (code !== 0) {
				const ERROR = `${MODULE_ID} ${CONVERT_FORMAT_COMMAND} ConversionCompletionError (${code}) => ${error}`;

				log.error(ERROR);

				reject(new Error(ERROR));
			} else {
				log.debug(
					`${MODULE_ID} ${CONVERT_FORMAT_COMMAND} ConversionCompletionSuccess`
				);

				resolve(targetBuffer);
			}
		});

		cmd.stdin.end(sourceBuffer);
	});
};

exports.command = CONVERT_FORMAT_COMMAND;
