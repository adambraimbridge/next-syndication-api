'use strict';

const fs = require('fs');
const path = require('path');

const { handlebars } = require('@financial-times/n-handlebars');
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
		webUrl: content.webUrl,
		wordCount: content.__wordCount
	};

	let hd = new DOMParser().parseFromString(HD(dict));
	let ft = new DOMParser().parseFromString(FT(dict));

	doc.documentElement.insertBefore(hd.documentElement, doc.documentElement.firstChild);
	doc.documentElement.appendChild(ft.documentElement);

	return doc;
};
