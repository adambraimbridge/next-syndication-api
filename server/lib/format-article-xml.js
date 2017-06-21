'use strict';

const { DOMParser } = require('xmldom');

module.exports = exports = xml => {
	let doc = new DOMParser().parseFromString(xml);

	removeElementsByTagName(doc, 'ft-related', 'script');
	// first sanitize content by striping inline XML elements without deleting the content
	removeProprietaryXML(doc, 'ft-content', 'ft-concept', 'a');
	// then remove the remaining top level XML elements with the same tagName
	removeElementsByTagName(doc, 'ft-content');
	removeWhiteSpace(doc);

	return doc;
};

exports.removeProprietaryXML = removeProprietaryXML;
exports.removeElementsByTagName = removeElementsByTagName;
exports.removeWhiteSpace = removeWhiteSpace;

function removeElementsByTagName (doc, ...tagNames) {
	tagNames.forEach(tagName =>
		Array.from(doc.getElementsByTagName(tagName)).forEach(el => el.parentNode.removeChild(el)));

	return doc;
}

function removeProprietaryXML (doc, ...tagNames) {
	tagNames.forEach(tagName => {
		Array.from(doc.getElementsByTagName(tagName)).forEach(el => {
			if (el.parentNode.nodeName === 'p') {
				let text = doc.createTextNode(el.firstChild.data);

				el.parentNode.insertBefore(text, el);

				el.parentNode.removeChild(el);
			}
			else {
				Array.from(el.childNodes).reverse().forEach(child => el.parentNode.insertBefore(child, el));

				el.parentNode.removeChild(el);
			}
		});
	});

	return doc;
}

function removeWhiteSpace (doc) {
	Array.from(doc.documentElement.childNodes).forEach(el => {
		if (el.nodeType !== 1) {
			el.parentNode.removeChild(el);
		}
	});

	return doc;
}