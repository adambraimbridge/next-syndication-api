'use strict';

const { EventEmitter } = require('events');
const path = require('path');
const { Writable: WritableStream } = require('stream');

const chai = require('chai');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

const {
	TEST: { FIXTURES_DIRECTORY },
	TRANSLATIONS
} = require('config');

const httpMocks = require(path.resolve(`${FIXTURES_DIRECTORY}/node-mocks-http`));

const { expect } = chai;
chai.use(sinonChai);

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe(MODULE_ID, function () {
	let underTest;

	const contractResponse = require(path.resolve(`${FIXTURES_DIRECTORY}/contractResponse.json`));

	const { initDB } = require(path.resolve(`${FIXTURES_DIRECTORY}/massive`))();

	const itemsEN = [
		require(path.resolve(`${FIXTURES_DIRECTORY}/content/52be3c0c-7831-11e7-a3e8-60495fe6ca71.json`)),
		require(path.resolve(`${FIXTURES_DIRECTORY}/content/b6e54ea4-86c4-11e7-8bb1-5ba57d47eff7.json`)),
	];
	const itemsES = [
		require(path.resolve(`${FIXTURES_DIRECTORY}/content/es/52be3c0c-7831-11e7-a3e8-60495fe6ca71.json`)),
		require(path.resolve(`${FIXTURES_DIRECTORY}/content/es/b6e54ea4-86c4-11e7-8bb1-5ba57d47eff7.json`))
	];

	describe('with a contract that does not allow `Spanish content` or `Spanish weekend`', function () {
		let next;
		let req;
		let res;
		let user_id;

		afterEach(function () {
			delete contractResponse.allowed;
		});

		beforeEach(function () {
			user_id = '8ef593a8-eef6-448c-8560-9ca8cdca80a5';

			underTest = proxyquire('../../../server/controllers/translations', {
				'../lib/get-content': sinon.stub().resolves({}),
				'../lib/get-all-existing-items-for-contract': sinon.stub().resolves({})
			});

			req = httpMocks.createRequest({
				'eventEmitter': EventEmitter,
				'connection': new EventEmitter(),
				'headers': {
					'ft-real-url': 'https://www.ft.com/syndication/translations?lang=es',
					'ft-real-path': '/syndication/translations?lang=es',
					'ft-vanity-url': '/syndication/translations?lang=es',
					'ft-flags-next-flags': '',
					'ft-flags': '-',
					'cookie': '',
					'accept-language': 'en-GB,en-US;q=0.8,en;q=0.6',
					'accept-encoding': 'gzip, deflate, sdch, br',
					'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
					'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
				},
				'hostname': 'localhost',
				'method': 'GET',
				'originalUrl': '/syndication/translations?lang=es',
				'params': {},
				'path': '/syndication/translations',
				'protocol': 'http',
				'query': {
					'lang': 'es'//,
//					'limit': 50,
//					'offset': 0,
//					'order': 'asc',
//					'query': 'telefone',
//					'sort': 'published_date'
				},
				'url': '/syndication/translations?lang=es'
			});

			res = httpMocks.createResponse({
				req,
				writableStream: WritableStream
			});

			res.sendStatus = sinon.stub();
			res.status = sinon.stub();
			res.json = sinon.stub();
			next = sinon.stub();

			const allowed = {
				contributor_content: true,
				spanish_content: false,
				spanish_weekend: false
			};

			contractResponse.allowed = allowed;

			res.locals = {
				allowed,
				contract: contractResponse,
				flags: {
					syndication: true,
					syndicationNew: 'on',
					syndicationRedux: 'on'
				},
				licence: {
					id: 'c3391af1-0d46-4ddc-a922-df7c49cf1552',
					users: [],
					usersMap: {}
				},
				syndication_contract: {
					id: contractResponse.contract_id
				},
				user: {
					download_format: 'docx',
					email: 'christos.constandinou@ft.com',
					user_id: user_id
				},
				userUuid: user_id
			};

			next = sinon.stub();
		});

		it('response: status should be 403', async function () {
			await underTest(req, res, next);

			expect(res.sendStatus).to.be.calledWith(403);
		});
	});

	describe('default call', function () {
//		let contentAreas;
		let db;
		let next;
		let getAllExistingItemsForContract;
		let req;
		let res;
		let user_id;

		afterEach(function () {
			delete contractResponse.allowed;
		});

		beforeEach(function () {
			user_id = '8ef593a8-eef6-448c-8560-9ca8cdca80a5';

			db = initDB(itemsES);

			getAllExistingItemsForContract = sinon.stub().resolves({});

			underTest = proxyquire('../../../server/controllers/translations', {
				'../lib/get-content': sinon.stub().resolves(itemsEN),
				'../lib/get-all-existing-items-for-contract': getAllExistingItemsForContract
			});

			req = httpMocks.createRequest({
				'eventEmitter': EventEmitter,
				'connection': new EventEmitter(),
				'headers': {
					'ft-real-url': 'https://www.ft.com/syndication/translations?lang=es',
					'ft-real-path': '/syndication/translations?lang=es',
					'ft-vanity-url': '/syndication/translations?lang=es',
					'ft-flags-next-flags': '',
					'ft-flags': '-',
					'cookie': '',
					'accept-language': 'en-GB,en-US;q=0.8,en;q=0.6',
					'accept-encoding': 'gzip, deflate, sdch, br',
					'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
					'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
				},
				'hostname': 'localhost',
				'method': 'GET',
				'originalUrl': '/syndication/translations?lang=es',
				'params': {},
				'path': '/syndication/translations',
				'protocol': 'http',
				'query': {
					'lang': 'es'//,
//					'limit': 50,
//					'offset': 0,
//					'order': 'asc',
//					'query': 'telefone',
//					'sort': 'published_date'
				},
				'url': '/syndication/translations?lang=es'
			});

			res = httpMocks.createResponse({
				req,
				writableStream: WritableStream
			});

			res.sendStatus = sinon.stub();
			res.status = sinon.stub();
			res.json = sinon.stub();
			next = sinon.stub();

			const allowed = {
				contributor_content: true,
				spanish_content: true,
				spanish_weekend: true
			};

			contractResponse.allowed = allowed;

			res.locals = {
				$DB: db,
				contract: contractResponse,
				allowed,
				flags: {
					syndication: true,
					syndicationNew: 'on',
					syndicationRedux: 'on'
				},
				licence: {
					id: 'c3391af1-0d46-4ddc-a922-df7c49cf1552',
					users: [],
					usersMap: {}
				},
				syndication_contract: {
					id: contractResponse.contract_id
				},
				user: {
					download_format: 'docx',
					email: 'christos.constandinou@ft.com',
					user_id: user_id
				},
				userUuid: user_id
			};

			next = sinon.stub();

//			contentAreas = [];
//
//			if (res.locals.allowed.spanish_content === true) {
//				contentAreas.push('Spanish content');
//			}
//			if (res.locals.allowed.spanish_weekend === true) {
//				contentAreas.push('Spanish weekend');
//			}
		});

		it('db.run called to get syndication.content_es', async function () {
			await underTest(req, res, next);

			const call = db.run.getCall(0);

			const query = call.args[0];

			expect(query).to.include('search_content_es');
//			expect(query).to.include(`content_areas => ARRAY[$text$${contentAreas.join('$text$::syndication.enum_content_area_es, $text$')}$text$::syndication.enum_content_area_es]`);
			expect(query).to.include('_offset => 0');
			expect(query).to.include(`_limit => ${TRANSLATIONS.PAGINATION.DEFAULT_LIMIT}`);
		});

		it('db.run called to get total number of syndication.content_es items', async function () {
			await underTest(req, res, next);

			const call = db.run.getCall(1);

			const query = call.args[0];

			expect(query).to.include('search_content_total_es');
//			expect(query).to.include(`content_areas => ARRAY[$text$${contentAreas.join('$text$::syndication.enum_content_area_es, $text$')}$text$::syndication.enum_content_area_es]`);
			expect(query).to.not.include('_offset => 0');
			expect(query).to.not.include(`_limit => ${TRANSLATIONS.PAGINATION.DEFAULT_LIMIT}`);
		});

		it('response: status', async function () {
			await underTest(req, res, next);

			expect(res.status).to.be.calledWith(200);
		});

		it('response: body', async function () {
			await underTest(req, res, next);

			const call = res.json.getCall(0);

			expect(call.args[0].items).to.be.an('array');
			expect(call.args[0].total).to.be.a('number');
		});

		it('next', async function () {
			await underTest(req, res, next);

			expect(next).to.have.been.called;
		});
	});

	describe('with custom offset and limit', function () {
//		let contentAreas;
		let db;
		let next;
		let getAllExistingItemsForContract;
		let req;
		let res;
		let user_id;

		afterEach(function () {
			delete contractResponse.allowed;
		});

		beforeEach(function () {
			user_id = '8ef593a8-eef6-448c-8560-9ca8cdca80a5';

			db = initDB(itemsES);

			getAllExistingItemsForContract = sinon.stub().resolves({});

			underTest = proxyquire('../../../server/controllers/translations', {
				'../lib/get-content': sinon.stub().resolves(itemsEN),
				'../lib/get-all-existing-items-for-contract': getAllExistingItemsForContract
			});

			req = httpMocks.createRequest({
				'eventEmitter': EventEmitter,
				'connection': new EventEmitter(),
				'headers': {
					'ft-real-url': 'https://www.ft.com/syndication/translations?lang=es',
					'ft-real-path': '/syndication/translations?lang=es',
					'ft-vanity-url': '/syndication/translations?lang=es',
					'ft-flags-next-flags': '',
					'ft-flags': '-',
					'cookie': '',
					'accept-language': 'en-GB,en-US;q=0.8,en;q=0.6',
					'accept-encoding': 'gzip, deflate, sdch, br',
					'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
					'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
				},
				'hostname': 'localhost',
				'method': 'GET',
				'originalUrl': '/syndication/translations?lang=es',
				'params': {},
				'path': '/syndication/translations',
				'protocol': 'http',
				'query': {
					'lang': 'es',
					'limit': 10,
					'offset': 50,
//					'order': 'asc',
//					'query': 'telefone',
//					'sort': 'published_date'
				},
				'url': '/syndication/translations?lang=es'
			});

			res = httpMocks.createResponse({
				req,
				writableStream: WritableStream
			});

			res.sendStatus = sinon.stub();
			res.status = sinon.stub();
			res.json = sinon.stub();
			next = sinon.stub();

			const allowed = {
				contributor_content: true,
				spanish_content: true,
				spanish_weekend: true
			};

			contractResponse.allowed = allowed;

			res.locals = {
				$DB: db,
				contract: contractResponse,
				allowed,
				flags: {
					syndication: true,
					syndicationNew: 'on',
					syndicationRedux: 'on'
				},
				licence: {
					id: 'c3391af1-0d46-4ddc-a922-df7c49cf1552',
					users: [],
					usersMap: {}
				},
				syndication_contract: {
					id: contractResponse.contract_id
				},
				user: {
					download_format: 'docx',
					email: 'christos.constandinou@ft.com',
					user_id: user_id
				},
				userUuid: user_id
			};

			next = sinon.stub();

//			contentAreas = [];
//
//			if (res.locals.allowed.spanish_content === true) {
//				contentAreas.push('Spanish content');
//			}
//			if (res.locals.allowed.spanish_weekend === true) {
//				contentAreas.push('Spanish weekend');
//			}
		});

		it('db.run called to get syndication.content_es', async function () {
			await underTest(req, res, next);

			const call = db.run.getCall(0);

			const query = call.args[0];

			expect(query).to.include('search_content_es');
//			expect(query).to.include(`content_areas => ARRAY[$text$${contentAreas.join('$text$::syndication.enum_content_area_es, $text$')}$text$::syndication.enum_content_area_es]`);
			expect(query).to.include(`_offset => ${req.query.offset}`);
			expect(query).to.include(`_limit => ${req.query.limit}`);
		});

		it('db.run called to get total number of syndication.content_es items', async function () {
			await underTest(req, res, next);

			const call = db.run.getCall(1);

			const query = call.args[0];

			expect(query).to.include('search_content_total_es');
//			expect(query).to.include(`content_areas => ARRAY[$text$${contentAreas.join('$text$::syndication.enum_content_area_es, $text$')}$text$::syndication.enum_content_area_es]`);
			expect(query).to.not.include(`_offset => ${req.query.offset}`);
			expect(query).to.not.include(`_limit => ${req.query.limit}`);
		});

		it('response: status', async function () {
			await underTest(req, res, next);

			expect(res.status).to.be.calledWith(200);
		});

		it('response: body', async function () {
			await underTest(req, res, next);

			const call = res.json.getCall(0);

			expect(call.args[0].items).to.be.an('array');
			expect(call.args[0].total).to.be.a('number');
		});

		it('next', async function () {
			await underTest(req, res, next);

			expect(next).to.have.been.called;
		});
	});

	describe('with custom content areas', function () {
//		let contentAreas;
		let db;
		let next;
		let getAllExistingItemsForContract;
		let req;
		let res;
		let user_id;

		afterEach(function () {
			delete contractResponse.allowed;
		});

		beforeEach(function () {
			user_id = '8ef593a8-eef6-448c-8560-9ca8cdca80a5';

			db = initDB(itemsES);

			getAllExistingItemsForContract = sinon.stub().resolves({});

			underTest = proxyquire('../../../server/controllers/translations', {
				'../lib/get-content': sinon.stub().resolves(itemsEN),
				'../lib/get-all-existing-items-for-contract': getAllExistingItemsForContract
			});

			req = httpMocks.createRequest({
				'eventEmitter': EventEmitter,
				'connection': new EventEmitter(),
				'headers': {
					'ft-real-url': 'https://www.ft.com/syndication/translations?lang=es',
					'ft-real-path': '/syndication/translations?lang=es',
					'ft-vanity-url': '/syndication/translations?lang=es',
					'ft-flags-next-flags': '',
					'ft-flags': '-',
					'cookie': '',
					'accept-language': 'en-GB,en-US;q=0.8,en;q=0.6',
					'accept-encoding': 'gzip, deflate, sdch, br',
					'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
					'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
				},
				'hostname': 'localhost',
				'method': 'GET',
				'originalUrl': '/syndication/translations?lang=es',
				'params': {},
				'path': '/syndication/translations',
				'protocol': 'http',
				'query': {
					'lang': 'es',
					'area': ['sc'],
					'limit': 10,
					'offset': 50,
//					'order': 'asc',
//					'query': 'telefone',
//					'sort': 'published_date'
				},
				'url': '/syndication/translations?lang=es'
			});

			res = httpMocks.createResponse({
				req,
				writableStream: WritableStream
			});

			res.sendStatus = sinon.stub();
			res.status = sinon.stub();
			res.json = sinon.stub();
			next = sinon.stub();


			const allowed = {
				contributor_content: true,
				spanish_content: true,
				spanish_weekend: true
			};

			contractResponse.allowed = allowed;

			res.locals = {
				$DB: db,
				contract: contractResponse,
				allowed,
				flags: {
					syndication: true,
					syndicationNew: 'on',
					syndicationRedux: 'on'
				},
				licence: {
					id: 'c3391af1-0d46-4ddc-a922-df7c49cf1552',
					users: [],
					usersMap: {}
				},
				syndication_contract: {
					id: contractResponse.contract_id
				},
				user: {
					download_format: 'docx',
					email: 'christos.constandinou@ft.com',
					user_id: user_id
				},
				userUuid: user_id
			};

			next = sinon.stub();

//			contentAreas = [];
//
//			if (res.locals.allowed.spanish_content === true) {
//				contentAreas.push('Spanish content');
//			}
//			if (res.locals.allowed.spanish_weekend === true) {
//				contentAreas.push('Spanish weekend');
//			}
		});

		it('db.run called to get syndication.content_es', async function () {
			await underTest(req, res, next);

			const call = db.run.getCall(0);

			const query = call.args[0];

			expect(query).to.include('search_content_es');
//			expect(query).to.include('content_areas => ARRAY[$text$Spanish content$text$::syndication.enum_content_area_es]');
			expect(query).to.include(`_offset => ${req.query.offset}`);
			expect(query).to.include(`_limit => ${req.query.limit}`);
		});

		it('db.run called to get total number of syndication.content_es items', async function () {
			await underTest(req, res, next);

			const call = db.run.getCall(1);

			const query = call.args[0];

			expect(query).to.include('search_content_total_es');
//			expect(query).to.include('content_areas => ARRAY[$text$Spanish content$text$::syndication.enum_content_area_es]');
			expect(query).to.not.include(`_offset => ${req.query.offset}`);
			expect(query).to.not.include(`_limit => ${req.query.limit}`);
		});

		it('response: status', async function () {
			await underTest(req, res, next);

			expect(res.status).to.be.calledWith(200);
		});

		it('response: body', async function () {
			await underTest(req, res, next);

			const call = res.json.getCall(0);

			expect(call.args[0].items).to.be.an('array');
			expect(call.args[0].total).to.be.a('number');
		});

		it('next', async function () {
			await underTest(req, res, next);

			expect(next).to.have.been.called;
		});
	});

	describe('with a query', function () {
//		let contentAreas;
		let db;
		let next;
		let getAllExistingItemsForContract;
		let req;
		let res;
		let user_id;

		afterEach(function () {
			delete contractResponse.allowed;
		});

		beforeEach(function () {
			user_id = '8ef593a8-eef6-448c-8560-9ca8cdca80a5';

			db = initDB(itemsES);

			getAllExistingItemsForContract = sinon.stub().resolves({});

			underTest = proxyquire('../../../server/controllers/translations', {
				'../lib/get-content': sinon.stub().resolves(itemsEN),
				'../lib/get-all-existing-items-for-contract': getAllExistingItemsForContract
			});

			req = httpMocks.createRequest({
				'eventEmitter': EventEmitter,
				'connection': new EventEmitter(),
				'headers': {
					'ft-real-url': 'https://www.ft.com/syndication/translations?lang=es',
					'ft-real-path': '/syndication/translations?lang=es',
					'ft-vanity-url': '/syndication/translations?lang=es',
					'ft-flags-next-flags': '',
					'ft-flags': '-',
					'cookie': '',
					'accept-language': 'en-GB,en-US;q=0.8,en;q=0.6',
					'accept-encoding': 'gzip, deflate, sdch, br',
					'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
					'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
				},
				'hostname': 'localhost',
				'method': 'GET',
				'originalUrl': '/syndication/translations?lang=es',
				'params': {},
				'path': '/syndication/translations',
				'protocol': 'http',
				'query': {
					'lang': 'es',
//					'limit': 50,
//					'offset': 0,
					'order': 'asc',
					'query': 'telefone',
					'sort': 'published'
				},
				'url': '/syndication/translations?lang=es'
			});

			res = httpMocks.createResponse({
				req,
				writableStream: WritableStream
			});

			res.sendStatus = sinon.stub();
			res.status = sinon.stub();
			res.json = sinon.stub();
			next = sinon.stub();

			const allowed = {
				contributor_content: true,
				spanish_content: true,
				spanish_weekend: true
			};

			contractResponse.allowed = allowed;

			res.locals = {
				$DB: db,
				contract: contractResponse,
				allowed,
				flags: {
					syndication: true,
					syndicationNew: 'on',
					syndicationRedux: 'on'
				},
				licence: {
					id: 'c3391af1-0d46-4ddc-a922-df7c49cf1552',
					users: [],
					usersMap: {}
				},
				syndication_contract: {
					id: contractResponse.contract_id
				},
				user: {
					download_format: 'docx',
					email: 'christos.constandinou@ft.com',
					user_id: user_id
				},
				userUuid: user_id
			};

			next = sinon.stub();

//			contentAreas = [];
//
//			if (res.locals.allowed.spanish_content === true) {
//				contentAreas.push('Spanish content');
//			}
//			if (res.locals.allowed.spanish_weekend === true) {
//				contentAreas.push('Spanish weekend');
//			}
		});

		it('db.run called to get syndication.content_es', async function () {
			await underTest(req, res, next);

			const call = db.run.getCall(0);

			const query = call.args[0];

			expect(query).to.include('search_content_es');
//			expect(query).to.include(`content_areas => ARRAY[$text$${contentAreas.join('$text$::syndication.enum_content_area_es, $text$')}$text$::syndication.enum_content_area_es]`);
			expect(query).to.include(`query => $text$${req.query.query}$text$`);
			expect(query).to.include('sort_col => $text$published_date$text$');
			expect(query).to.include('sort_dir => $text$ASC$text$');
			expect(query).to.include('_offset => 0');
			expect(query).to.include(`_limit => ${TRANSLATIONS.PAGINATION.DEFAULT_LIMIT}`);
		});

		it('db.run called to get total number of syndication.content_es items', async function () {
			await underTest(req, res, next);

			const call = db.run.getCall(1);

			const query = call.args[0];

			expect(query).to.include('search_content_total_es');
//			expect(query).to.include(`content_areas => ARRAY[$text$${contentAreas.join('$text$::syndication.enum_content_area_es, $text$')}$text$::syndication.enum_content_area_es]`);
			expect(query).to.include(`query => $text$${req.query.query}$text$`);
			expect(query).to.not.include('sort_col => $text$published_date$text$');
			expect(query).to.not.include('sort_dir => $text$ASC$text$');
			expect(query).to.not.include('_offset => 0');
			expect(query).to.not.include(`_limit => ${TRANSLATIONS.PAGINATION.DEFAULT_LIMIT}`);
		});

		it('response: status', async function () {
			await underTest(req, res, next);

			expect(res.status).to.be.calledWith(200);
		});

		it('response: body', async function () {
			await underTest(req, res, next);

			const call = res.json.getCall(0);

			expect(call.args[0].items).to.be.an('array');
			expect(call.args[0].total).to.be.a('number');
		});

		it('next', async function () {
			await underTest(req, res, next);

			expect(next).to.have.been.called;
		});
	});

	describe('with a custom sort column and sort order', function () {
//		let contentAreas;
		let db;
		let next;
		let getAllExistingItemsForContract;
		let req;
		let res;
		let user_id;

		afterEach(function () {
			delete contractResponse.allowed;
		});

		beforeEach(function () {
			user_id = '8ef593a8-eef6-448c-8560-9ca8cdca80a5';

			db = initDB(itemsES);

			getAllExistingItemsForContract = sinon.stub().resolves({});

			underTest = proxyquire('../../../server/controllers/translations', {
				'../lib/get-content': sinon.stub().resolves(itemsEN),
				'../lib/get-all-existing-items-for-contract': getAllExistingItemsForContract
			});

			req = httpMocks.createRequest({
				'eventEmitter': EventEmitter,
				'connection': new EventEmitter(),
				'headers': {
					'ft-real-url': 'https://www.ft.com/syndication/translations?lang=es',
					'ft-real-path': '/syndication/translations?lang=es',
					'ft-vanity-url': '/syndication/translations?lang=es',
					'ft-flags-next-flags': '',
					'ft-flags': '-',
					'cookie': '',
					'accept-language': 'en-GB,en-US;q=0.8,en;q=0.6',
					'accept-encoding': 'gzip, deflate, sdch, br',
					'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
					'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
				},
				'hostname': 'localhost',
				'method': 'GET',
				'originalUrl': '/syndication/translations?lang=es',
				'params': {},
				'path': '/syndication/translations',
				'protocol': 'http',
				'query': {
					'lang': 'es',
//					'limit': 50,
//					'offset': 0,
					'order': 'asc',
//					'query': 'telefone',
					'sort': 'published'
				},
				'url': '/syndication/translations?lang=es'
			});

			res = httpMocks.createResponse({
				req,
				writableStream: WritableStream
			});

			res.sendStatus = sinon.stub();
			res.status = sinon.stub();
			res.json = sinon.stub();
			next = sinon.stub();

			const allowed = {
				contributor_content: true,
				spanish_content: true,
				spanish_weekend: true
			};

			contractResponse.allowed = allowed;

			res.locals = {
				$DB: db,
				contract: contractResponse,
				allowed,
				flags: {
					syndication: true,
					syndicationNew: 'on',
					syndicationRedux: 'on'
				},
				licence: {
					id: 'c3391af1-0d46-4ddc-a922-df7c49cf1552',
					users: [],
					usersMap: {}
				},
				syndication_contract: {
					id: contractResponse.contract_id
				},
				user: {
					download_format: 'docx',
					email: 'christos.constandinou@ft.com',
					user_id: user_id
				},
				userUuid: user_id
			};

			next = sinon.stub();

//			contentAreas = [];
//
//			if (res.locals.allowed.spanish_content === true) {
//				contentAreas.push('Spanish content');
//			}
//			if (res.locals.allowed.spanish_weekend === true) {
//				contentAreas.push('Spanish weekend');
//			}
		});

		it('db.run called to get syndication.content_es', async function () {
			await underTest(req, res, next);

			const call = db.run.getCall(0);

			const query = call.args[0];

			expect(query).to.include('search_content_es');
//			expect(query).to.include(`content_areas => ARRAY[$text$${contentAreas.join('$text$::syndication.enum_content_area_es, $text$')}$text$::syndication.enum_content_area_es]`);
			expect(query).to.include('sort_col => $text$published_date$text$');
			expect(query).to.include('sort_dir => $text$ASC$text$');
			expect(query).to.include('_offset => 0');
			expect(query).to.include(`_limit => ${TRANSLATIONS.PAGINATION.DEFAULT_LIMIT}`);
		});

		it('db.run called to get total number of syndication.content_es items', async function () {
			await underTest(req, res, next);

			const call = db.run.getCall(1);

			const query = call.args[0];

			expect(query).to.include('search_content_total_es');
//			expect(query).to.include(`content_areas => ARRAY[$text$${contentAreas.join('$text$::syndication.enum_content_area_es, $text$')}$text$::syndication.enum_content_area_es]`);
			expect(query).to.not.include('sort_col => $text$published_date$text$');
			expect(query).to.not.include('sort_dir => $text$ASC$text$');
			expect(query).to.not.include('_offset => 0');
			expect(query).to.not.include(`_limit => ${TRANSLATIONS.PAGINATION.DEFAULT_LIMIT}`);
		});

		it('response: status', async function () {
			await underTest(req, res, next);

			expect(res.status).to.be.calledWith(200);
		});

		it('response: body', async function () {
			await underTest(req, res, next);

			const call = res.json.getCall(0);

			expect(call.args[0].items).to.be.an('array');
			expect(call.args[0].total).to.be.a('number');
		});

		it('next', async function () {
			await underTest(req, res, next);

			expect(next).to.have.been.called;
		});
	});
});
