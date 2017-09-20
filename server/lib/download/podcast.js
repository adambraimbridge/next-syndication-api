'use strict';

const VideoDownload = require('./video');

module.exports = exports = class PodcastDownload extends VideoDownload {

	get [Symbol.toStringTag]() {
		return 'PodcastDownload';
	}
};
