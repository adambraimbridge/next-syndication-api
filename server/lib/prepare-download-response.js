'use strict';

const {DOWNLOAD_ARTICLE_EXTENSION_OVERRIDES} = require('config');

module.exports = exports = (content, res) => {
    let extension = DOWNLOAD_ARTICLE_EXTENSION_OVERRIDES[content.extension] || content.extension;

    res.attachment(`${content.fileName}.${extension}`);
};