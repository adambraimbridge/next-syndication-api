'use strict';

const fs = require('fs');
const path = require('path');

const handlebars  = require('./handlebars');
const moment = require('moment');
const { DOMParser } = require('xmldom');

const Handlebars = handlebars();

const BASE_PATH = path.dirname(path.relative(process.cwd(), __dirname));
const HD = Handlebars.compile(fs.readFileSync(path.resolve(BASE_PATH, './views/partial/article_metadata_hd.html.hbs'), 'utf8'), { noEscape: true });
const FT = Handlebars.compile(fs.readFileSync(path.resolve(BASE_PATH, './views/partial/article_metadata_ft.html.hbs'), 'utf8'), { noEscape: true });

module.exports = exports = (doc, content) => {
	let publishedDate = moment(content.publishedDate);
	let dict = {
		byline: content.byline,
		publishedDate: publishedDate.format('DD MMMM YYYY'),
		publishedYear: publishedDate.format('YYYY'),
		rich: content.extension !== 'plain',
		title: content.title,
		webUrl: content.url || content.webUrl,
		wordCount: content.wordCount
	};

	if (content.lang && content.lang !== 'en') {
		dict.translatedDate = moment(content.translated_date).format('DD MMMM YYYY');
		dict.translationUrl = `https://www.ft.com/republishing/spanish/${content.content_id}`;

		switch (content.lang) {
			case 'es':
				dict.translationLanguage = 'Spanish';
				break;
		}
	}

	let hd = new DOMParser().parseFromString(HD(dict));
	let ft = new DOMParser().parseFromString(FT(dict));

	doc.documentElement.insertBefore(hd.documentElement, doc.documentElement.firstChild);
	doc.documentElement.appendChild(ft.documentElement);

	return doc;
};
