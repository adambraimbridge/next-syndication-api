'use strict';

const path = require('path');

const { expect } = require('chai');

const { DOMParser } = require('xmldom');

const underTest = require('../../../server/lib/decorate-article');

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe(MODULE_ID, function () {
	let content = {
		id: 'http://www.ft.com/thing/b59dff10-3f7e-11e7-9d56-25f963e998b2',
		type: 'http://www.ft.com/ontology/content/Article',
		bodyXML: '<body><ft-content type="http://www.ft.com/ontology/content/ImageSet" url="http://api.ft.com/content/16a642f4-3f84-11e7-1cd0-1ef14f87a411" data-embedded="true"></ft-content><p>Google is turning to its prowess in artificial intelligence in its latest charm offensive in China, seeking to appeal to fans of the complex board game Go and party officials in the country where its search engine remains blocked.</p>\n<p>The US group’s <ft-content type="http://www.ft.com/ontology/content/Article" url="http://api.ft.com/content/cada14c4-d366-11e6-b06b-680c49b4b4c0">AlphaGo computer program</ft-content> beat Ke Jie, 19, the world champion player of the complicated ancient game developed in China, in the surprisingly short first match of a three-game series. </p>\n<p>Last year, AlphaGo, a program developed by DeepMind, a London start-up acquired by Google in 2014, sealed a landmark achievement for AI when it <ft-content type="http://www.ft.com/ontology/content/Article" url="http://api.ft.com/content/302d79cc-e6e3-11e5-a09b-1f8b0d268c39" title="DeepMind’s Go victory could herald step change in AI - FT.com">defeated Lee Se-dol of South Korea</ft-content>. The victory was the first time a computer had beaten the world champion.</p>\n<p>Eric Schmidt, chairman of <ft-concept type="http://www.ft.com/ontology/company/PublicCompany" url="http://api.ft.com/organisations/2ece7d55-f2c5-30d5-8119-df841dfb64ea">Alphabet</ft-concept>, Google’s parent, kicked off the five-day Go tournament and AI summit in Wuzhen, near Shanghai, on Tuesday alongside officials from the Communist party and central government. The tournament is Google’s biggest public event in partnership with the government since its <a href="http://www.ft.com/cms/s/0/faf86fbc-0009-11df-8626-00144feabdc0.html">search engine was frozen out of the country seven years ago</a>.</p>\n<p>Over the past year, AlphaGo has become one of Google’s best-known brands in China, where Go was invented 3,000 years ago. The country has hundreds of millions of Go fans and a “big interest in AI at a grassroots level”, notes <ft-content type="http://www.ft.com/ontology/content/Article" url="http://api.ft.com/content/048f418c-2487-11e7-a34a-538b4cb30025" title="The mind in the machine: Demis Hassabis on artificial intelligence - FT.com">Demis Hassabis</ft-content>, co-founder of DeepMind.</p>\n<ft-related url="https://www.eventbrite.com/e/ft-engage-what-will-we-do-when-machines-do-everything-tickets-34695741898?aff=PROMOBOX"><title>Live event</title><headline>What will we do when machines do everything?\n</headline><media><ft-content type="http://www.ft.com/ontology/content/ImageSet" url="http://api.ft.com/content/16e86360-4096-11e7-1cd0-1ef14f87a411" data-embedded="true"></ft-content></media><intro><p>Join us on June 19th for a conversation about automation and what it means for the future world of work. </p></intro></ft-related>\n<p>“We were told everyone in China knows about AlphaGo,” he said. “When we go out to Korea or China [the level of interest in us] is pretty crazy.”</p>\n<p>Mr Hassabis plans to visit Chinese companies and institutes to discuss ways of using AI commercially and in scientific research. The government considers AI research crucial for upgrading its slowing economy.</p>\n<p>Despite the fervour of Chinese fans — more than 1m of whom watched the live streaming of last year’s games in South Korea — the authorities banned live streaming of AlphaGo’s first match against Mr Ke on Tuesday, although it was unclear why.</p>\n<p>“It’s disgusting, I need to use a VPN to watch a world-famous event which features a Chinese master playing the game that Chinese invented,” wrote one disappointed fan on Weibo, China’s Twitter-like social media platform.</p>\n<ft-related type="http://www.ft.com/ontology/content/Article" url="http://api.ft.com/content/048f418c-2487-11e7-a34a-538b4cb30025"><headline>The mind in the machine: Demis Hassabis on artificial intelligence\n</headline><media><ft-content type="http://www.ft.com/ontology/content/ImageSet" url="http://api.ft.com/content/2e055d50-2453-11e7-18f7-426d3ab9a15f" data-embedded="true"></ft-content></media><intro><p>The co-founder of DeepMind explains how AI will help us make unimaginable leaps in understanding the world</p></intro></ft-related>\n<p>“Ke Jie versus AlphaGo” was one of the top trending topics on Weibo on Tuesday morning, with 17.3m views.</p>\n<p>Chinese media livestreamed Google’s Developer Day conference in Beijing last year without running into any restrictions.</p>\n<p>Google pulled its search engine from China in 2010 after several years of conflict with the government over the censoring of politically sensitive keywords.  </p>\n<p>A senior official involved in discussions with the company told the Financial Times that the country’s <ft-content type="http://www.ft.com/ontology/content/Article" url="http://api.ft.com/content/6b24d1b8-1ac9-11e7-bcac-6d03d067f81f">relationship with the US business is improving</ft-content>.</p>\n<p>China is the biggest market missing from Google’s empire, particularly in the growing area of mobile revenue. Although a third of the world’s users of Google’s Android smartphone operating system are in China, none can access the Google Play app store, meaning the company loses out on the world’s biggest source of mobile app sales. </p>\n<p><em>Additional reporting by Yingzhi Yang</em>\n</p>\n</body>',
		title: 'Google deploys AI for Go tournament in China charm offensive',
		alternativeTitles: { promotionalTitle: 'Google deploys AI in China charm offensive' },
		standfirst: 'Computer program beats human champion in soft-power push aimed at breaking barriers',
		alternativeStandfirsts: {},
		byline: 'Yuan Yang in Wuzhen',
		firstPublishedDate: '2017-05-23T08:59:01.000Z',
		publishedDate: '2017-05-23T08:59:01.000Z',
		requestUrl: 'http://api.ft.com/content/b59dff10-3f7e-11e7-9d56-25f963e998b2',
		brands: ['http://api.ft.com/things/dbb0bdae-1f0c-11e4-b0cb-b2227cce2b54'],
		mainImage: { id: 'http://api.ft.com/content/16a642f4-3f84-11e7-1cd0-1ef14f87a411' },
		alternativeImages: {},
		standout: { editorsChoice: false, exclusive: false, scoop: false },
		publishReference: 'tid_fc4nmrjrzs_carousel_1496630870',
		canBeDistributed: 'yes',
		canBeSyndicated: 'yes',
		webUrl: 'http://www.ft.com/cms/s/b59dff10-3f7e-11e7-9d56-25f963e998b2.html',
		bodyXML__CLEAN: '<body><p>Google is turning to its prowess in artificial intelligence in its latest charm offensive in China, seeking to appeal to fans of the complex board game Go and party officials in the country where its search engine remains blocked.</p><p>The US group’s AlphaGo computer program beat Ke Jie, 19, the world champion player of the complicated ancient game developed in China, in the surprisingly short first match of a three-game series. </p><p>Last year, AlphaGo, a program developed by DeepMind, a London start-up acquired by Google in 2014, sealed a landmark achievement for AI when it defeated Lee Se-dol of South Korea. The victory was the first time a computer had beaten the world champion.</p><p>Eric Schmidt, chairman of Alphabet, Google’s parent, kicked off the five-day Go tournament and AI summit in Wuzhen, near Shanghai, on Tuesday alongside officials from the Communist party and central government. The tournament is Google’s biggest public event in partnership with the government since its <a href="http://www.ft.com/cms/s/0/faf86fbc-0009-11df-8626-00144feabdc0.html">search engine was frozen out of the country seven years ago</a>.</p><p>Over the past year, AlphaGo has become one of Google’s best-known brands in China, where Go was invented 3,000 years ago. The country has hundreds of millions of Go fans and a “big interest in AI at a grassroots level”, notes Demis Hassabis, co-founder of DeepMind.</p><p>“We were told everyone in China knows about AlphaGo,” he said. “When we go out to Korea or China [the level of interest in us] is pretty crazy.”</p><p>Mr Hassabis plans to visit Chinese companies and institutes to discuss ways of using AI commercially and in scientific research. The government considers AI research crucial for upgrading its slowing economy.</p><p>Despite the fervour of Chinese fans — more than 1m of whom watched the live streaming of last year’s games in South Korea — the authorities banned live streaming of AlphaGo’s first match against Mr Ke on Tuesday, although it was unclear why.</p><p>“It’s disgusting, I need to use a VPN to watch a world-famous event which features a Chinese master playing the game that Chinese invented,” wrote one disappointed fan on Weibo, China’s Twitter-like social media platform.</p><p>“Ke Jie versus AlphaGo” was one of the top trending topics on Weibo on Tuesday morning, with 17.3m views.</p><p>Chinese media livestreamed Google’s Developer Day conference in Beijing last year without running into any restrictions.</p><p>Google pulled its search engine from China in 2010 after several years of conflict with the government over the censoring of politically sensitive keywords.  </p><p>A senior official involved in discussions with the company told the Financial Times that the country’s relationship with the US business is improving.</p><p>China is the biggest market missing from Google’s empire, particularly in the growing area of mobile revenue. Although a third of the world’s users of Google’s Android smartphone operating system are in China, none can access the Google Play app store, meaning the company loses out on the world’s biggest source of mobile app sales. </p><p><em>Additional reporting by Yingzhi Yang</em>\n</p></body>',

		__wordCount: 492,
		extension: 'docx'
	};

	let xml = new DOMParser().parseFromString(content.bodyXML__CLEAN);

	it('returns a xmldom.dom.Document instance', function () {
		expect(underTest(xml, content).constructor.name).to.equal('Document');
	});

	it('returns the same xmldom.dom.Document instance it was passed', function () {
		expect(underTest(xml, content)).to.equal(xml);
	});

	it('prepends a header to the XML Document', function () {
		underTest(xml, content);

		let el = xml.documentElement.firstChild;

		expect(el.tagName).to.equal('header');
	});

	it('appends a footer to the XML Document', function () {
		underTest(xml, content);

		let el = xml.documentElement.lastChild;

		expect(el.tagName).to.equal('footer');
	});
});
