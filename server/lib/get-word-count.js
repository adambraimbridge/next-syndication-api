'use strict';

const RE_VALID_ONE_CHARS = /^[IAa0-9]$/;

module.exports = exports = doc => {
	let textContent = walk(doc.documentElement, []);

	textContent = textContent.join(' ').trim().split(/[\u{32}\u{160}\s]/u)
		.filter(item => !!item && (item.length > 1 || RE_VALID_ONE_CHARS.test(item)));

	return textContent.length;
};

function walk(el, textContent) {
	Array.from(el.childNodes).forEach(el => {
		if (el.nodeType === 3) {
			textContent.push(el.data);
		}
		else {
			walk(el, textContent);
		}
	});

	return textContent;
}
