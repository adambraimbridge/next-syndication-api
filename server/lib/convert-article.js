'use strict';

const { spawn } = require('child_process');

const log = require('./logger');

const { CONVERT_FORMAT_COMMAND } = require('config');

module.exports = exports = ({ source, sourceFormat = 'html', targetFormat = 'docx' }) => {
	const sourceBuffer = Buffer.from(source, 'utf8');

	let args = [
		'--from', sourceFormat,
		'--to', targetFormat
	];

	if (targetFormat === 'plain') {
		args.push('--wrap', 'none');
	}

	return new Promise((resolve, reject) => {
		let cmd = spawn(CONVERT_FORMAT_COMMAND, args);

		let targetBuffer = Buffer.from('', 'utf8');
		let stderr = '';

		cmd.on('error', error => {
			log.error({
				cmd: CONVERT_FORMAT_COMMAND,
				event: 'CONVERSION_ERROR',
				error
			});

			reject(error);
		});

		cmd.stdout.on('data', chunk => {
			targetBuffer = Buffer.concat([targetBuffer, chunk])
		});

		cmd.stderr.on('data', chunk => {
			stderr += chunk
		});

		cmd.on('close', code => {
			if (code !== 0) {
				const error = new Error(`Command '${CONVERT_FORMAT_COMMAND}' exited with code ${code}`);

				log.error({
					event: 'CONVERSION_COMPLETION_ERROR',
					cmd: CONVERT_FORMAT_COMMAND,
					code,
					stderr,
					error
				});

				reject(error)
			}
			else {
				log.debug(`${CONVERT_FORMAT_COMMAND} ConversionCompletionSuccess`);

				resolve(targetBuffer);
			}
		});

		cmd.stdin.end(sourceBuffer);
	});
};

exports.command = CONVERT_FORMAT_COMMAND;
