'use strict';

const config = {
	env: {
		browser: true,
		es6: true,
		mocha: true,
		node: true,
	},
	parserOptions: {
		ecmaVersion: 2017,
		sourceType: 'module',
	},
	rules: {
		eqeqeq: 2,
		'guard-for-in': 2,
		'new-cap': 0,
		'no-caller': 2,
		'no-console': 2,
		'no-extend-native': 2,
		'no-irregular-whitespace': 0,
		'no-loop-func': 2,
		'no-multi-spaces': 0,
		'no-undef': 2,
		'no-underscore-dangle': 0,
		'no-unused-vars': 2,
		'no-var': 2,
		'one-var': [2, 'never'],
		quotes: [2, 'single'],
		'space-before-function-paren': [0, 'never'],
		'wrap-iife': 2,
		'prettier/prettier': 'warn',
	},
	globals: {
		fetch: true,
		requireText: true,
	},
	plugins: ['prettier'],
	extends: [],
};

module.exports = config;
