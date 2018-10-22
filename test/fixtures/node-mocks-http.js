'use strict';

const sinon = require('sinon');
const mocks = require('node-mocks-http');
//const Request = require('node-mocks-http/lib/mockRequest');
const Response = require('node-mocks-http/lib/mockResponse');

exports.express = mocks.express;
exports.createMocks = mocks.createMocks;
exports.createRequest = mocks.createRequest;

const _createResponse = Response.createResponse;

exports.createResponse = function createResponse(options) {
	const response = _createResponse(options);

	const _pipe = response.pipe;
	const _end = response.end;
	const _write = response.write;

	const pipes = [];

	// our stream goes missing in `node-mocks-http` and it doesn't handle streaming responses
	// so we need to fudge it.
	response.pipe = function(stream) {
		pipes.push(stream);

		return typeof _pipe === 'function' ? _pipe.call(this, stream) : this;
	};
	response.end = function(...args) {
		pipes.forEach(pipe => pipe.end(...args));

		return typeof _end === 'function' ? _end.apply(this, args) : this;
	};
	response.write = function(...args) {
		pipes.forEach(pipe => pipe.write(...args));

		return typeof _write === 'function' ? _write.apply(this, args) : this;
	};
	response.attachment = sinon.spy();

	return response;
};
