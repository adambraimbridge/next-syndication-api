'use strict';

const RE_PARAGRAPHS = /<(p|h1)\s*[^>]*>(.*?)<\/\1>/gim;
const RE_REMOVE_TAGS = /<\/?[^>]*>/gm;

module.exports = exports = html => {
	return '<p>' + html.trim().split('\n').map(line => line.trim()).join('').replace(RE_PARAGRAPHS, '$2\n\n').replace(RE_REMOVE_TAGS, '').trim().split('\n\n').join('</p><p>') + '</p>';
};