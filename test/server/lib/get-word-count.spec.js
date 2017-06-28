'use strict';

const path = require('path');

const { expect } = require('chai');

const { DOMParser } = require('xmldom');

const underTest = require('../../../server/lib/get-word-count');

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

const TRICK_LINT = '';

describe(MODULE_ID, function () {
	[
		/* eslint-disable no-trailing-spaces */
		[15, `<p>
	The quick brown fox jumped over the lazy dog. Roughly 5 times in 1 day.
</p>`],
		[15, `<p>
	The <strong>
		quick brown
	</strong> fox jumped over the lazy dog.
	Roughly <em>5</em> times in 1 day.
</p>`],
		[30, `<p>
	The <strong>
		quick brown
	</strong>
	fox jumped over the lazy dog.
	Roughly <em>5</em> times in 1 day.
</p><p>
	The <strong>
		quick brown
	</strong>
	fox jumped over the lazy dog.
	Roughly
	<em>
		5
	</em>
	times in 1 day.
</p>`],
		[30, `<p>
	The <strong>
		quick brown
	</strong>
	fox jumped over the lazy dog.
	Roughly <em>5</em> times in 1 day.
</p><p>
	The <strong>
		quick brown
	</strong>
	fox jumped over the lazy dog.
	Roughly
	<em>
		5
	</em>
	times in 1 day.
</p>`],
		[492, `${TRICK_LINT}<body><p>Google is turning to its prowess in artificial intelligence in its latest charm offensive in China, seeking to appeal tofans of the complex board game Go and party officials in the country where its search engine remains blocked.</p><p>The US group’s AlphaGo computer program beat Ke Jie, 19, the world champion player of the complicated ancient game developed in China, in the surprisingly short first match of a three-game series.</p><p>Last year, AlphaGo, a program developed by DeepMind, a London start-up acquired by Google in 2014, sealed a landmark achievement for AI when it defeated Lee Se-dol of South Korea. The victory was the first time a computer had beaten the world champion.</p><p>Eric Schmidt, chairman of Alphabet, Google’s parent, kicked off the five-day Go tournament and AI summit in Wuzhen, near Shanghai, on Tuesday alongside officials from the Communist party and central government. The tournament is Google’s biggest public event in partnership with the government since its<a href="http://www.ft.com/cms/s/0/faf86fbc-0009-11df-8626-00144feabdc0.html">search engine was frozen out of the country seven years ago</a>.</p><p>Over the past year, AlphaGo has become one of Google’s best-known brands in China, where Go was invented 3,000 years ago. The country has hundreds of millions of Go fans and a “big interest in AI at a grassroots level”, notes Demis Hassabis, co-founder of DeepMind.</p><p>“We were told everyone in China knows about AlphaGo,” he said. “When we go out to Korea or China [the level of interest in us] is pretty crazy.”</p><p>Mr Hassabis plans to visit Chinese companies and institutes to discuss ways of using AI commercially and in scientific research. The government considers AI research crucial for upgrading its slowing economy.</p><p>Despite the fervour of Chinese fans — more than 1m of whom watched the live streaming of last year’s games in South Korea — the authorities banned live streaming of AlphaGo’s first match against Mr Ke on Tuesday, although it was unclear why. </p><p>“It’s disgusting, I need to use a VPN to watch a world-famous event which features a Chinese master playing the game that Chinese invented,” wrote one disappointed fan on Weibo, China’s Twitter-like social media platform.</p><p>“Ke Jie versus AlphaGo” was one of the top trending topics on Weibo on Tuesday morning, with 17.3m views.</p><p>Chinese media livestreamed Google’s Developer Day conference in Beijing last year without running into any restrictions.</p><p>Google pulled its search engine from China in 2010 after several years of conflict with the government over the censoring of politically sensitive keywords.</p><p>A senior official involved in discussions with the company told the Financial Times that the country’s relationship with the US business is improving.</p><p>China is the biggest market missing from Google’s empire, particularly in the growing area of mobile revenue. Although a third of the world’s users of Google’s Android smartphone operating system are in China, none can access the Google Play app store, meaning the company loses out on the world’s biggest source of mobile app sales.</p><p><em>Additional reporting by Yingzhi Yang</em></p></body>`]
		/* eslint-enable no-trailing-spaces */
	].forEach(([expectedCount, xml]) => {
		let doc = new DOMParser().parseFromString(`<body>${xml}</body>`);

		it(`should have ${expectedCount} words`, function () {
			expect(underTest(doc)).to.equal(expectedCount);
		});
	});
});
