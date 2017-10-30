'use strict';

const { EventEmitter } = require('events');
const path = require('path');
const { Writable: WritableStream } = require('stream');

const chai = require('chai');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

const {
	TEST: { FIXTURES_DIRECTORY }
} = require('config');

const httpMocks = require(path.resolve(`${FIXTURES_DIRECTORY}/node-mocks-http`));

const { expect } = chai;
chai.use(sinonChai);

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe(MODULE_ID, function () {
	let underTest;

	const contractResponse = require(path.resolve(`${FIXTURES_DIRECTORY}/contractResponse.json`));

	const items = [{
		'syndication_state': 'yes',
		'state': 'complete',
		'content_id': 'http://www.ft.com/thing/0c56a4f2-6bc5-11e7-bfeb-33fe0c5b7eaa',
		'user_email': 'christos.constandinou@ft.com',
		'user_name': 'christos constandinou',
		'user_id': '8ef593a8-eef6-448c-8560-9ca8cdca80a5',
		'contract_id': 'CA-00001558',
		'licence_id': 'c3391af1-0d46-4ddc-a922-df7c49cf1552',
		'download_format': 'docx',
		'_id': '9807a4b6dcb3ce1188593759dd6818cd',
		'time': '2017-07-19T15:08:50.786Z',
		'version': 'v1',
		'contributor_content': false
	}, {
		'syndication_state': 'yes',
		'state': 'complete',
		'content_id': 'http://www.ft.com/thing/0aaee458-6c6e-11e7-bfeb-33fe0c5b7eaa',
		'user_email': 'christos.constandinou@ft.com',
		'user_name': 'christos constandinou',
		'user_id': '8ef593a8-eef6-448c-8560-9ca8cdca80a5',
		'contract_id': 'CA-00001558',
		'licence_id': 'c3391af1-0d46-4ddc-a922-df7c49cf1552',
		'download_format': 'docx',
		'_id': 'f55885427fa5f8c3e2b90204a6e6b0c7',
		'time': '2017-07-19T15:08:45.881Z',
		'version': 'v1',
		'contributor_content': false
	}, {
		'syndication_state': 'yes',
		'state': 'saved',
		'content_id': 'http://www.ft.com/thing/74447ca2-6b0b-11e7-bfeb-33fe0c5b7eaa',
		'user_email': 'christos.constandinou@ft.com',
		'user_name': 'christos constandinou',
		'user_id': '8ef593a8-eef6-448c-8560-9ca8cdca80a5',
		'contract_id': 'CA-00001558',
		'licence_id': 'c3391af1-0d46-4ddc-a922-df7c49cf1552',
		'_id': '4eff4aba81093b44d2a71c36fc8e9898',
		'time': '2017-07-19T15:08:43.075Z',
		'version': 'v1',
		'contributor_content': false
	}, {
		'syndication_state': 'yes',
		'state': 'saved',
		'content_id': 'http://www.ft.com/thing/eaef2e2c-6c61-11e7-b9c7-15af748b60d0',
		'user_email': 'christos.constandinou@ft.com',
		'user_name': 'christos constandinou',
		'user_id': '8ef593a8-eef6-448c-8560-9ca8cdca80a5',
		'contract_id': 'CA-00001558',
		'licence_id': 'c3391af1-0d46-4ddc-a922-df7c49cf1552',
		'_id': 'c71c4e6cf5183996a34235bf50bc0e1d',
		'time': '2017-07-19T15:08:40.930Z',
		'version': 'v1',
		'contributor_content': false
	}];

//	const itemsMap = items.reduce((acc, item) => {
//		acc[item.content_id] = item;
//
//		return acc;
//	}, {});

	const contentItems = [ {
		'id': 'http://www.ft.com/thing/0c56a4f2-6bc5-11e7-bfeb-33fe0c5b7eaa',
		'type': 'http://www.ft.com/ontology/content/Article',
		'bodyXML': '<body><ft-content type="http://www.ft.com/ontology/content/ImageSet" url="http://api.ft.com/content/ef05ef34-653e-11e7-0400-0461ef5f0ab7" data-embedded="true"></ft-content><p>Britain has put the EU on notice that it has the right to return radioactive waste to the bloc after it leaves, in an attempt to increase the UK’s negotiating clout on the vexed issue of nuclear regulation.</p>\n<p>UK officials hope raising complex questions over what should happen to Britain’s stockpile of radioactive materials — some of which originate from EU countries including Germany, Italy and Sweden — will convince Brussels to take a co-operative approach to the nuclear issue.</p>\n<p>“It might just be a reminder that a boatload of plutonium could end up at a harbour in Antwerp unless an arrangement is made,” said one nuclear expert who has advised the government.    </p>\n<p>Britain has imported spent nuclear fuel from the rest of Europe since the 1970s for reprocessing at the state-owned Sellafield plant in Cumbria — producing reusable uranium and plutonium, but also <a href="https://www.gov.uk/government/collections/managing-nuclear-materials-and-spent-fuels" title="Managing nuclear materials and spent fuels - Gov.uk">radioactive waste</a>.</p>\n<p>A paper setting out the <a href="https://www.gov.uk/government/uploads/system/uploads/attachment_data/file/627909/FINAL_OFF_SEN_Position_Paper_HMG_Nuclear_materials_and_safeguards_issues_Position_Paper_FINAL_120717__3_.pdf" title="UK position paper - Gov.uk">UK position</a> for Brexit negotiations stressed the right “to return radioactive waste . . . to its country of origin”, in what one British official described as a coded warning to Brussels about the EU’s interest in reaching a consensus.</p>\n<p>The paper also highlighted the responsibility of EU countries for some “special fissile materials” — the most dangerous and tightly-regulated types of nuclear substances, including plutonium — derived from imported spent fuel. Almost one-fifth of the UK’s 126-tonne stockpile of civilian plutonium at Sellafield comes from overseas.</p>\n<p>Nuclear regulation has become one of the knottiest issues in the early stages of negotiations about the UK exiting the EU because Britain must disentangle itself from the <ft-content type="http://www.ft.com/ontology/content/Article" url="http://api.ft.com/content/9b99159e-ff2a-11e6-96f8-3700c5664d30" title="The nuclear fallout from Brexit - FT.com">Euratom treaty</ft-content> governing the civilian use of atomic technology in Europe.</p>\n<p>Leaders of the UK nuclear industry are <ft-content type="http://www.ft.com/ontology/content/Article" url="http://api.ft.com/content/8c81e82c-623c-11e7-8814-0ac7eb84e5f1" title="Euratom matters to the UK - FT.com">lobbying the government</ft-content> to find a way of remaining part of Euratom or, if that proves impossible, to negotiate an extended transition deal to allow time to establish a new regulatory system.</p>\n<p>However, either of those options would require continued jurisdiction by the European Court of Justice — something Theresa May, UK prime minister, has so far resisted.</p>\n<p>Those arguing for Mrs May to compromise have highlighted the threat of disruption to UK supplies of nuclear fuel, reactor parts and <ft-content type="http://www.ft.com/ontology/content/Article" url="http://api.ft.com/content/f146cd86-6714-11e7-8526-7b38dcaef614" title="EU officials warn UK over radioactive isotopes - FT.com">medical isotopes</ft-content> used in cancer treatments if Britain fails to reach a deal with Brussels.</p>\n<p>However, UK negotiators are attempting to exert their own leverage by highlighting the potential costs to the EU of a disorderly British exit from Euratom.</p>\n<p>While the <a href="https://ec.europa.eu/commission/sites/beta-political/files/essential-principles-nuclear-materials-safeguard-equipment_en.pdf" title="EU position paper - European Commission">EU position paper</a> on Euratom deals with basic issues over ownership and separation, the UK response stresses the “strong mutual interest in ensuring close co-operation in the future”.</p>\n<p>Similar tactics are being used by British diplomats across a range of areas in the first stage of divorce talks, from the status of the European Investment Bank to the EU’s ownership of radioactive testing kit at Sellafield.</p>\n<p>EU diplomats said they had noted the veiled threat on nuclear waste: one joked that they would have “the coastguard ready”.</p>\n<p>Nuclear waste was among topics discussed by EU and British negotiators in Brussels on Tuesday, but an official involved declined to offer a detailed account. </p>\n<p>Francis Livens, director of the Dalton Nuclear Institute at Manchester University, said the UK’s right to return nuclear waste was already enshrined in commercial contracts under which spent fuel was imported to Sellafield. However, plutonium extracted from the spent fuel posed a trickier problem, he added. </p>\n<p>A plant built at Sellafield to recycle the plutonium into new nuclear fuel was <ft-content type="http://www.ft.com/ontology/content/Article" url="http://api.ft.com/content/1a5cf3be-bdf0-11e0-ab9f-00144feabdc0" title="Sellafield nuclear reprocessing site to close - FT.com">closed in 2011</ft-content> after only a decade of operation because of technological flaws and weak demand. This has left the UK sitting on the world’s largest civilian stockpile of plutonium, stored as powder in flasks at a heavily guarded building at Sellafield.</p>\n<p>A new plant would be required to either resume recycling of the plutonium into nuclear fuel or to turn it into a form that could be safely returned to its country of origin as waste. “We’re going to have to build something very expensive to deal with this plutonium whichever option we choose,” said Prof Livens.</p>\n<p>Separating UK plutonium from that derived from imported spent fuel — and assigning responsibility for the costs of storing and eventually processing it — promises to be a complex challenge for Brexit negotiators. Under Euratom law, all special fissile material within the treaty area is considered commonly owned — including plutonium.</p>\n<p>“Reprocessing is like a sausage machine. You put in some British fuel, then some Japanese, then some Belgian,” said Prof Livens. “You can’t point to a single atom and say, ‘that’s Belgian’.” </p>\n<p>The UK Department for Business, Energy and Industrial Strategy said negotiations would focus on the “legal ownership not physical location” of nuclear materials. What happens to materials once ownership has been settled “will be a matter for the owner and the UK to agree on commercial terms,” it added. </p>\n<p>David Davis, the UK Brexit secretary, has hinted at the potential for Britain to negotiate associate membership of Euratom. But, while Switzerland has such a deal covering research co-operation, an association agreement covering safeguarding of fissile materials or trade in nuclear materials would be legally unprecedented.</p>\n</body>',
		'title': 'UK issues coded warning to Brussels over nuclear waste',
		'alternativeTitles': { 'promotionalTitle': 'UK issues warning to Brussels over nuclear waste' },
		'standfirst': 'Britain highlights right to dispatch atomic material to Europe after Brexit',
		'alternativeStandfirsts': {},
		'byline': 'Andrew Ward in London and Alex Barker in Brussels',
		'firstPublishedDate': '2017-07-19T12:17:10.000Z',
		'publishedDate': '2017-07-19T12:17:10.000Z',
		'requestUrl': 'http://api.ft.com/content/0c56a4f2-6bc5-11e7-bfeb-33fe0c5b7eaa',
		'brands': ['http://api.ft.com/things/dbb0bdae-1f0c-11e4-b0cb-b2227cce2b54'],
		'mainImage': { 'id': 'http://api.ft.com/content/ef05ef34-653e-11e7-0400-0461ef5f0ab7' },
		'alternativeImages': {},
		'standout': { 'editorsChoice': false, 'exclusive': false, 'scoop': false },
		'publishReference': 'tid_lu1xjzolwm',
		'canBeDistributed': 'yes',
		'canBeSyndicated': 'yes',
		'webUrl': 'http://www.ft.com/cms/s/0c56a4f2-6bc5-11e7-bfeb-33fe0c5b7eaa.html',
		'contentType': 'article',
		'extension': 'docx',
		'wordCount': 843,
		'__wordCount': 843,
		'bodyXML__CLEAN': '<body><header>\n    <h1>UK issues coded warning to Brussels over nuclear waste</h1>\n    <p>19 July 2017</p>\n    <p><strong style="font-weight: bold;">Andrew Ward in London and Alex Barker in Brussels</strong></p>\n    <p><strong style="font-weight: bold">Source: FT.com</strong></p>\n    <p><strong style="font-weight: bold;">Word count: 843</strong></p>\n    <p><strong style="font-weight: bold;">Link To FT.com: <a href="http://www.ft.com/cms/s/0c56a4f2-6bc5-11e7-bfeb-33fe0c5b7eaa.html">http://www.ft.com/cms/s/0c56a4f2-6bc5-11e7-bfeb-33fe0c5b7eaa.html</a></strong></p>\n    </header><p>Britain has put the EU on notice that it has the right to return radioactive waste to the bloc after it leaves, in an attempt to increase the UK’s negotiating clout on the vexed issue of nuclear regulation.</p><p>UK officials hope raising complex questions over what should happen to Britain’s stockpile of radioactive materials — some of which originate from EU countries including Germany, Italy and Sweden — will convince Brussels to take a co-operative approach to the nuclear issue.</p><p>“It might just be a reminder that a boatload of plutonium could end up at a harbour in Antwerp unless an arrangement is made,” said one nuclear expert who has advised the government.    </p><p>Britain has imported spent nuclear fuel from the rest of Europe since the 1970s for reprocessing at the state-owned Sellafield plant in Cumbria — producing reusable uranium and plutonium, but also radioactive waste.</p><p>A paper setting out the UK position for Brexit negotiations stressed the right “to return radioactive waste . . . to its country of origin”, in what one British official described as a coded warning to Brussels about the EU’s interest in reaching a consensus.</p><p>The paper also highlighted the responsibility of EU countries for some “special fissile materials” — the most dangerous and tightly-regulated types of nuclear substances, including plutonium — derived from imported spent fuel. Almost one-fifth of the UK’s 126-tonne stockpile of civilian plutonium at Sellafield comes from overseas.</p><p>Nuclear regulation has become one of the knottiest issues in the early stages of negotiations about the UK exiting the EU because Britain must disentangle itself from the Euratom treaty governing the civilian use of atomic technology in Europe.</p><p>Leaders of the UK nuclear industry are lobbying the government to find a way of remaining part of Euratom or, if that proves impossible, to negotiate an extended transition deal to allow time to establish a new regulatory system.</p><p>However, either of those options would require continued jurisdiction by the European Court of Justice — something Theresa May, UK prime minister, has so far resisted.</p><p>Those arguing for Mrs May to compromise have highlighted the threat of disruption to UK supplies of nuclear fuel, reactor parts and medical isotopes used in cancer treatments if Britain fails to reach a deal with Brussels.</p><p>However, UK negotiators are attempting to exert their own leverage by highlighting the potential costs to the EU of a disorderly British exit from Euratom.</p><p>While the EU position paper on Euratom deals with basic issues over ownership and separation, the UK response stresses the “strong mutual interest in ensuring close co-operation in the future”.</p><p>Similar tactics are being used by British diplomats across a range of areas in the first stage of divorce talks, from the status of the European Investment Bank to the EU’s ownership of radioactive testing kit at Sellafield.</p><p>EU diplomats said they had noted the veiled threat on nuclear waste: one joked that they would have “the coastguard ready”.</p><p>Nuclear waste was among topics discussed by EU and British negotiators in Brussels on Tuesday, but an official involved declined to offer a detailed account. </p><p>Francis Livens, director of the Dalton Nuclear Institute at Manchester University, said the UK’s right to return nuclear waste was already enshrined in commercial contracts under which spent fuel was imported to Sellafield. However, plutonium extracted from the spent fuel posed a trickier problem, he added. </p><p>A plant built at Sellafield to recycle the plutonium into new nuclear fuel was closed in 2011 after only a decade of operation because of technological flaws and weak demand. This has left the UK sitting on the world’s largest civilian stockpile of plutonium, stored as powder in flasks at a heavily guarded building at Sellafield.</p><p>A new plant would be required to either resume recycling of the plutonium into nuclear fuel or to turn it into a form that could be safely returned to its country of origin as waste. “We’re going to have to build something very expensive to deal with this plutonium whichever option we choose,” said Prof Livens.</p><p>Separating UK plutonium from that derived from imported spent fuel — and assigning responsibility for the costs of storing and eventually processing it — promises to be a complex challenge for Brexit negotiators. Under Euratom law, all special fissile material within the treaty area is considered commonly owned — including plutonium.</p><p>“Reprocessing is like a sausage machine. You put in some British fuel, then some Japanese, then some Belgian,” said Prof Livens. “You can’t point to a single atom and say, ‘that’s Belgian’.” </p><p>The UK Department for Business, Energy and Industrial Strategy said negotiations would focus on the “legal ownership not physical location” of nuclear materials. What happens to materials once ownership has been settled “will be a matter for the owner and the UK to agree on commercial terms,” it added. </p><p>David Davis, the UK Brexit secretary, has hinted at the potential for Britain to negotiate associate membership of Euratom. But, while Switzerland has such a deal covering research co-operation, an association agreement covering safeguarding of fissile materials or trade in nuclear materials would be legally unprecedented.</p><footer>\n    <p>Copyright The Financial Times Limited 2017</p>\n    <p>© 2017 The Financial Times Ltd. All rights reserved. Please do not copy and paste FT articles and redistribute by email or post to the web.</p>\n</footer></body>',
		'fileName': 'FT_UK_issues_co'
	}, {
		'id': 'http://www.ft.com/thing/0aaee458-6c6e-11e7-bfeb-33fe0c5b7eaa',
		'type': 'http://www.ft.com/ontology/content/Article',
		'bodyXML': '<body><ft-content type="http://www.ft.com/ontology/content/ImageSet" url="http://api.ft.com/content/55c4033a-6c6c-11e7-27a1-8235aeffcb99" data-embedded="true"></ft-content><p>The UK economy surprised observers with a <ft-content type="http://www.ft.com/ontology/content/Article" url="http://api.ft.com/content/98401c74-6b97-11e7-bfeb-33fe0c5b7eaa" title="www.ft.com">fall in inflation</ft-content> this week — although at 2.6 per cent year on year, prices are still rising faster than the Bank of England’s target. The squeeze on real incomes is continuing.</p>\n<p><img src="http://com.ft.imagepublish.prod.s3.amazonaws.com/128ca93a-6b97-11e7-bfeb-33fe0c5b7eaa" width="600"/>\n</p>\n<p>Chris Giles goes through the various <ft-content type="http://www.ft.com/ontology/content/Article" url="http://api.ft.com/content/bf036874-6b9d-11e7-bfeb-33fe0c5b7eaa" title="www.ft.com">explanations</ft-content> for the slowdown in price growth, the most plausible being that June was just a blip before inflation accelerates again.</p>\n<p>While we wait to find out, the Resolution Foundation has put its finger on an important fact that tends to be obscured by the overall inflation numbers published by the Office for National Statistics. This is because different types of households spend their money on different things, they also experience different inflation rates. The Resolution Foundation’s Stephen Clarke <a href="http://www.resolutionfoundation.org/media/blog/inflation-afflictions/" title="www.resolutionfoundation.org">breaks down household spending</a> by categories of expenditure and calculates that the poorest households have faced faster price growth for their typical consumption basket (2 per cent over the first six months of this year) than have the richest households (1.8 per cent).</p>\n<p>This obviously affects the politics of inflation. And this has been a pattern for while. An <a href="https://www.ons.gov.uk/ons/guide-method/user-guidance/prices/cpi-and-rpi/variation-in-the-inflation-experience-of-uk-households--2003-2014.pdf" title="www.ons.gov.uk">ONS study</a> of differential inflation experience for different types of households between 2003 and 2014 found that the “price of products purchased by households in the lowest expenditure decile increased on average by 3.7% per year over this period, compared with just 2.3% for the highest-expenditure decile”. Looking at income rather than expenditure yields equivalent conclusions.</p>\n<p>Citing similar evidence that inflation fell more for the rich than for the poor in 2013-14, Clarke suggests that “even if inflation abates . . . it may not provide as much benefit for poorer households . . . This could mean that the current squeeze on living standards is longer and deeper than previously expected for lower income households.”</p>\n<p>There are also clear differences in the <em>variability</em> of experienced inflation between different groups. That is documented in the ONS study for the UK. <a href="https://www.federalreserve.gov/econresdata/feds/2014/files/201489pap.pdf" title="www.federalreserve.gov">US data</a> also exhibit such differences in volatility, which are found to correlate with different <em>expectations</em> of inflation from different demographic groups — even when, on the whole, those differences are not borne out by actual <a href="https://www.clevelandfed.org/newsroom%20and%20events/publications/economic%20commentary/2011%20economic%20commentaries/ec%20201107%20demographic%20differences%20in%20inflation%20expectations%20what%20do%20they%20really%20mean" title="www.clevelandfed.org">experienced inflation</a>.</p>\n<p>But expectations of inflation may matter as much as actually experienced inflation. That seems particularly important in countries where squeezed living standards have resulted in strong political insurgencies against the establishment. </p>\n<p>The ONS study includes this tantalising paragraph: “Comparing the [overall consumer prices index] with the inflation outturns for different groups, this paper concludes that the CPI is broadly representative of the price experience of households around two-thirds of the way up the expenditure distribution. An equivalent, ‘democratic’ price index — which weights the inflation experience of households equally, rather than drawing on household sector expenditure weights — is around 0.3 percentage points higher on average than the plutocratic measure over this period.”</p>\n<p>That is quite a distance between officially measured costs of living and how they are experienced by the majority of people. It almost invites an unscrupulous politician to complain about “fake numbers” in a “rigged system”.</p>\n<h3 class="ft-subhead">Other readables</h3>\n<ul><li>We must <ft-content type="http://www.ft.com/ontology/content/Article" url="http://api.ft.com/content/3278e6dc-67af-11e7-9a66-93fb352ba1fe" title="www.ft.com">take back control</ft-content> over our private data, argues Sarah Gordon.</li>\n<li>The biggest challenge presented by Donald Trump is the <ft-content type="http://www.ft.com/ontology/content/Article" url="http://api.ft.com/content/5127c9e8-6b03-11e7-bfeb-33fe0c5b7eaa" title="www.ft.com">enfeebled country</ft-content> his election exposes — and that’s a bigger problem for the US itself than for the rest of the world. </li>\n</ul>\n<h3 class="ft-subhead">Numbers news</h3>\n<ul><li>US <ft-content type="http://www.ft.com/ontology/content/Article" url="http://api.ft.com/content/f691d448-e74b-3970-a944-48d5f5201de2" title="www.ft.com">financial conditions</ft-content> are the loosest in three years.<br/>\n<img src="http://www.ft.com/fastft/files/2017/07/finConditions-web.png" width="600"/>\n</li>\n</ul>\n<p><em>To receive Martin Sandbu’s <a href="http://www.ft.com/martin-sandbu-free-lunch" title="Martin Sandbu\'s Free Lunch">Free Lunch</a> by email every workday, <a href="http://nbe.ft.com/nbe/profile.cfm" title="nbe.ft.com">sign up here</a>\n</em>\n</p>\n</body>',
		'title': 'The tensions hiding behind a single inflation rate',
		'alternativeTitles': { 'promotionalTitle': 'The tensions hiding behind a single inflation rate' },
		'standfirst': 'Different households see prices change in different ways',
		'alternativeStandfirsts': {},
		'byline': 'Martin Sandbu',
		'firstPublishedDate': '2017-07-19T12:45:01.000Z',
		'publishedDate': '2017-07-19T12:45:01.000Z',
		'requestUrl': 'http://api.ft.com/content/0aaee458-6c6e-11e7-bfeb-33fe0c5b7eaa',
		'brands': ['http://api.ft.com/things/dbb0bdae-1f0c-11e4-b0cb-b2227cce2b54'],
		'mainImage': { 'id': 'http://api.ft.com/content/55c4033a-6c6c-11e7-27a1-8235aeffcb99' },
		'alternativeImages': {},
		'standout': { 'editorsChoice': false, 'exclusive': false, 'scoop': false },
		'publishReference': 'tid_jflishz8jo',
		'canBeDistributed': 'yes',
		'canBeSyndicated': 'yes',
		'webUrl': 'http://www.ft.com/cms/s/0aaee458-6c6e-11e7-bfeb-33fe0c5b7eaa.html',
		'contentType': 'article',
		'extension': 'docx',
		'wordCount': 567,
		'__wordCount': 567,
		'bodyXML__CLEAN': '<body><header>\n    <h1>The tensions hiding behind a single inflation rate</h1>\n    <p>19 July 2017</p>\n    <p><strong style="font-weight: bold;">Martin Sandbu</strong></p>\n    <p><strong style="font-weight: bold">Source: FT.com</strong></p>\n    <p><strong style="font-weight: bold;">Word count: 567</strong></p>\n    <p><strong style="font-weight: bold;">Link To FT.com: <a href="http://www.ft.com/cms/s/0aaee458-6c6e-11e7-bfeb-33fe0c5b7eaa.html">http://www.ft.com/cms/s/0aaee458-6c6e-11e7-bfeb-33fe0c5b7eaa.html</a></strong></p>\n    </header><p>The UK economy surprised observers with a fall in inflation this week — although at 2.6 per cent year on year, prices are still rising faster than the Bank of England’s target. The squeeze on real incomes is continuing.</p><p>\n</p><p>Chris Giles goes through the various explanations for the slowdown in price growth, the most plausible being that June was just a blip before inflation accelerates again.</p><p>While we wait to find out, the Resolution Foundation has put its finger on an important fact that tends to be obscured by the overall inflation numbers published by the Office for National Statistics. This is because different types of households spend their money on different things, they also experience different inflation rates. The Resolution Foundation’s Stephen Clarke breaks down household spending by categories of expenditure and calculates that the poorest households have faced faster price growth for their typical consumption basket (2 per cent over the first six months of this year) than have the richest households (1.8 per cent).</p><p>This obviously affects the politics of inflation. And this has been a pattern for while. An ONS study of differential inflation experience for different types of households between 2003 and 2014 found that the “price of products purchased by households in the lowest expenditure decile increased on average by 3.7% per year over this period, compared with just 2.3% for the highest-expenditure decile”. Looking at income rather than expenditure yields equivalent conclusions.</p><p>Citing similar evidence that inflation fell more for the rich than for the poor in 2013-14, Clarke suggests that “even if inflation abates . . . it may not provide as much benefit for poorer households . . . This could mean that the current squeeze on living standards is longer and deeper than previously expected for lower income households.”</p><p>There are also clear differences in the <em>variability</em> of experienced inflation between different groups. That is documented in the ONS study for the UK. US data also exhibit such differences in volatility, which are found to correlate with different <em>expectations</em> of inflation from different demographic groups — even when, on the whole, those differences are not borne out by actual experienced inflation.</p><p>But expectations of inflation may matter as much as actually experienced inflation. That seems particularly important in countries where squeezed living standards have resulted in strong political insurgencies against the establishment. </p><p>The ONS study includes this tantalising paragraph: “Comparing the [overall consumer prices index] with the inflation outturns for different groups, this paper concludes that the CPI is broadly representative of the price experience of households around two-thirds of the way up the expenditure distribution. An equivalent, ‘democratic’ price index — which weights the inflation experience of households equally, rather than drawing on household sector expenditure weights — is around 0.3 percentage points higher on average than the plutocratic measure over this period.”</p><p>That is quite a distance between officially measured costs of living and how they are experienced by the majority of people. It almost invites an unscrupulous politician to complain about “fake numbers” in a “rigged system”.</p><h3 class="ft-subhead">Other readables</h3><ul><li>We must take back control over our private data, argues Sarah Gordon.</li>\n<li>The biggest challenge presented by Donald Trump is the enfeebled country his election exposes — and that’s a bigger problem for the US itself than for the rest of the world. </li>\n</ul><h3 class="ft-subhead">Numbers news</h3><ul><li>US financial conditions are the loosest in three years.<br/>\n\n</li>\n</ul><p><em>To receive Martin Sandbu’s Free Lunch by email every workday, sign up here\n</em>\n</p><footer>\n    <p>Copyright The Financial Times Limited 2017</p>\n    <p>© 2017 The Financial Times Ltd. All rights reserved. Please do not copy and paste FT articles and redistribute by email or post to the web.</p>\n</footer></body>',
		'fileName': 'FT_The_tensions'
	}, {
		'id': 'http://www.ft.com/thing/74447ca2-6b0b-11e7-bfeb-33fe0c5b7eaa',
		'type': 'http://www.ft.com/ontology/content/Article',
		'bodyXML': '<body><ft-content type="http://www.ft.com/ontology/content/ImageSet" url="http://api.ft.com/content/5558218c-6baa-11e7-218d-a464d62fd5e3" data-embedded="true"></ft-content><p><ft-concept type="http://www.ft.com/ontology/company/PublicCompany" url="http://api.ft.com/organisations/78ba35a6-bb0a-3c71-b41e-6e526da1170d">Uber</ft-concept>’s reported revenues are being cut in half and sales at <ft-concept type="http://www.ft.com/ontology/company/PublicCompany" url="http://api.ft.com/organisations/23629959-5137-384a-a8af-3f7d9cb16912">Amazon</ft-concept> and <ft-concept type="http://www.ft.com/ontology/company/PublicCompany" url="http://api.ft.com/organisations/0b09e7fb-d889-3879-a1c2-2dd0272943e3">Microsoft</ft-concept> could be higher than previously stated — all thanks to a forthcoming change to <ft-content type="http://www.ft.com/ontology/content/Article" url="http://api.ft.com/content/94e0f54e-d3c1-11e6-9341-7393bb2e1b51">accounting rules</ft-content>.</p>\n<p>An update to generally accepted accounting principles (GAAP) for US companies is turning out to have particularly large consequences in parts of the tech industry, which is having to overhaul the way it reports revenues and costs.</p>\n<p>As companies announce their second-quarter <a href="https://www.ft.com/corporate-earnings">earnings </a>in the coming days, analysts will be watching closely for clues as to how their financials will be affected by the far-reaching change, which public companies must adopt by the beginning of next year.</p>\n<p>“There’s a real risk that Wall Street analysts will misunderstand the numbers as they’re being restated,” said Tien Tzuo, chief executive of <ft-concept type="http://www.ft.com/ontology/company/PublicCompany" url="http://api.ft.com/organisations/f0fe3f26-9bc1-349e-8fef-be7307e5f5a5">Zuora</ft-concept>, which makes software for companies that have subscription businesses.</p>\n<p>A handful of companies have already switched to the new standard, including <ft-concept type="http://www.ft.com/ontology/company/PublicCompany" url="http://api.ft.com/organisations/2ece7d55-f2c5-30d5-8119-df841dfb64ea">Alphabet </ft-concept>and <ft-concept type="http://www.ft.com/ontology/company/PublicCompany" url="http://api.ft.com/organisations/0c3b89df-7818-315e-a315-fb016682a906">Workday</ft-concept>, and accountants say many others are scrambling to understand how the changes will affect their top and bottom lines.</p>\n<p>In some cases, a change in the timing of when costs are recognised will lead to higher profits under GAAP accounting, though other companies will see no change at all.</p>\n<p><ft-content type="http://www.ft.com/ontology/content/ImageSet" url="http://api.ft.com/content/3e31be5c-6c98-11e7-27a1-8235aeffcb99" data-embedded="true"></ft-content>One of the more dramatic impacts will affect car-booking services such as Uber, a private company whose GAAP revenue drops by more than half when it adopts the new standard, which it plans to do this year.</p>\n<p>Uber’s first-quarter revenue this year was $3.4bn under old GAAP accounting, but it says that under the new rules its revenue would have been just $1.5bn for the same period. Uber has already started sharing the lower figure with investors.</p>\n<p>Under the old standard, car-booking services such as Uber and <ft-concept type="http://www.ft.com/ontology/company/PublicCompany" url="http://api.ft.com/organisations/71f486b0-453e-3bc6-8990-9a6cb680b65e">Lyft</ft-concept> counted their commissions from regular rides, plus the entire fare of carpool rides, as revenue. Under the new standard, only the commissions from both regular and carpool rides will count as revenue. </p>\n<ft-content type="http://www.ft.com/ontology/content/ImageSet" url="http://api.ft.com/content/a1a5b378-6c6e-11e7-27a1-8235aeffcb99" data-embedded="true"></ft-content>\n<p>The shift is due to changes to the “principal versus agent” rules that determine when a company is acting as a principal and when it is acting as an agent. The car-booking services were previously considered the “principal” for carpooled rides. As private companies, they must adopt the new standard by the beginning of 2019, although Uber has moved to do so much earlier. </p>\n<p>The new standard, known as Revenue from Contracts with Customers, is designed to narrow the distance between US GAAP rules and International Financial Reporting Standards (IFRS).</p>\n<p>“We are going from a lot of . . . rules that are principles based, to more judgment, more estimates, as well as a lot of disclosure requirements,” says Eloise Wagner, partner at <ft-concept type="http://www.ft.com/ontology/company/PublicCompany" url="http://api.ft.com/organisations/7921133f-d313-3009-8510-39d66df1b2f1">Ernst &amp; Young</ft-concept>. “It is a big change.”</p>\n<p>The software industry is set to be one of the most deeply affected. Operating under highly specific industry rules for when revenue can be recognised, and with many companies in the midst of a transition from upfront licence sales to a software subscription model, the move to an entirely new accounting regime will force complex changes.</p>\n<p>The precise effects will depend on the fine print of each company’s contracts, Mr Tzuo said, many of them developed with older accounting rules in mind.</p>\n<p>Under so-called “ramp” deals, for instance, customers pay more in the later years of a contract. But under the new rules, the revenue recognition will have to be spread evenly over the period, resulting in more sales being reported earlier. And companies that sell both hardware and software — often accounting for each element separately — will have to treat them as a single sale if they are judged to be part of a single IT system.</p>\n<p><ft-content type="http://www.ft.com/ontology/content/ImageSet" url="http://api.ft.com/content/3d1028e2-6c98-11e7-27a1-8235aeffcb99" data-embedded="true"></ft-content>Microsoft has said the impact on its revenue will be material, as sales of Windows 10 licences, which are currently treated as a rateable licence fee spread over a number of years, are all recognised upfront.</p>\n<p>Cloud software companies, meanwhile, could benefit by deferring more of their costs until future years.</p>\n<p>With marketing and sales costs amounting to more than half of total revenues for some software-as-a-service (SaaS) companies, the impact on high-growth companies in particular could be significant, said Mr Tzuo. Salesforce, the biggest SaaS company, has said that it will delay the recognition of more of its sales commissions, something that will improve its reported profitability.</p>\n<p>Even when the absolute numbers are not large, the impact may still be significant. Most SaaS companies operate at a loss or with very marginal profitability, making any boost to their bottom lines noteworthy.</p>\n<ft-related url="https://www.ft.com/newsletters"><title>#techFT</title><headline>Sign up to your daily email briefing\n</headline><media><ft-content type="http://www.ft.com/ontology/content/ImageSet" url="http://api.ft.com/content/e2db72f6-61a6-11e7-1672-9d5d31f04eb8" data-embedded="true"></ft-content></media><intro><p>Track trends in tech, media and telecoms</p></intro></ft-related>\n<p>Workday, the first SaaS company to adopt the new accounting rules earlier this year, said the change had lifted its pro-forma operating profit margin to 3.3 per cent in the latest financial year, compared with the 1.9 per cent it would have reported under the old rules.</p>\n<p>Meanwhile, analysts and investors will have to be on the look out for idiosyncratic effects — and to make sure they do not mistake higher reported revenues for a real change in the underlying business. </p>\n<p>Amazon has said that the new standard means that it will recognise revenue sooner when it sells electronic devices such as Kindles via non-Amazon stores, and will also recognise revenue sooner from the unused portion of gift cards. \n</p>\n</body>',
		'title': 'Uber, Amazon and Microsoft braced for accounting shake-up',
		'alternativeTitles': {
			'promotionalTitle': 'Uber, Amazon and Microsoft braced for accounting shake-up',
			'contentPackageTitle': 'Uber, Amazon and Microsoft brace for accounting shake-up'
		},
		'standfirst': 'Changes mean tech industry must overhaul how it reports revenues and costs',
		'alternativeStandfirsts': {},
		'byline': 'Leslie Hook and Richard Waters in San Francisco',
		'firstPublishedDate': '2017-07-19T10:00:17.000Z',
		'publishedDate': '2017-07-19T10:00:17.000Z',
		'requestUrl': 'http://api.ft.com/content/74447ca2-6b0b-11e7-bfeb-33fe0c5b7eaa',
		'brands': ['http://api.ft.com/things/dbb0bdae-1f0c-11e4-b0cb-b2227cce2b54'],
		'mainImage': { 'id': 'http://api.ft.com/content/5558218c-6baa-11e7-218d-a464d62fd5e3' },
		'alternativeImages': {},
		'standout': { 'editorsChoice': false, 'exclusive': false, 'scoop': false },
		'publishReference': 'tid_zpsdkitghi',
		'canBeDistributed': 'yes',
		'canBeSyndicated': 'yes',
		'webUrl': 'http://www.ft.com/cms/s/74447ca2-6b0b-11e7-bfeb-33fe0c5b7eaa.html',
		'contentType': 'article',
		'extension': 'docx',
		'wordCount': 868,
		'__wordCount': 868,
		'bodyXML__CLEAN': '<body><header>\n    <h1>Uber, Amazon and Microsoft braced for accounting shake-up</h1>\n    <p>19 July 2017</p>\n    <p><strong style="font-weight: bold;">Leslie Hook and Richard Waters in San Francisco</strong></p>\n    <p><strong style="font-weight: bold">Source: FT.com</strong></p>\n    <p><strong style="font-weight: bold;">Word count: 868</strong></p>\n    <p><strong style="font-weight: bold;">Link To FT.com: <a href="http://www.ft.com/cms/s/74447ca2-6b0b-11e7-bfeb-33fe0c5b7eaa.html">http://www.ft.com/cms/s/74447ca2-6b0b-11e7-bfeb-33fe0c5b7eaa.html</a></strong></p>\n    </header><p>Uber’s reported revenues are being cut in half and sales at Amazon and Microsoft could be higher than previously stated — all thanks to a forthcoming change to accounting rules.</p><p>An update to generally accepted accounting principles (GAAP) for US companies is turning out to have particularly large consequences in parts of the tech industry, which is having to overhaul the way it reports revenues and costs.</p><p>As companies announce their second-quarter earnings in the coming days, analysts will be watching closely for clues as to how their financials will be affected by the far-reaching change, which public companies must adopt by the beginning of next year.</p><p>“There’s a real risk that Wall Street analysts will misunderstand the numbers as they’re being restated,” said Tien Tzuo, chief executive of Zuora, which makes software for companies that have subscription businesses.</p><p>A handful of companies have already switched to the new standard, including Alphabet and Workday, and accountants say many others are scrambling to understand how the changes will affect their top and bottom lines.</p><p>In some cases, a change in the timing of when costs are recognised will lead to higher profits under GAAP accounting, though other companies will see no change at all.</p><p>One of the more dramatic impacts will affect car-booking services such as Uber, a private company whose GAAP revenue drops by more than half when it adopts the new standard, which it plans to do this year.</p><p>Uber’s first-quarter revenue this year was $3.4bn under old GAAP accounting, but it says that under the new rules its revenue would have been just $1.5bn for the same period. Uber has already started sharing the lower figure with investors.</p><p>Under the old standard, car-booking services such as Uber and Lyft counted their commissions from regular rides, plus the entire fare of carpool rides, as revenue. Under the new standard, only the commissions from both regular and carpool rides will count as revenue. </p><p>The shift is due to changes to the “principal versus agent” rules that determine when a company is acting as a principal and when it is acting as an agent. The car-booking services were previously considered the “principal” for carpooled rides. As private companies, they must adopt the new standard by the beginning of 2019, although Uber has moved to do so much earlier. </p><p>The new standard, known as Revenue from Contracts with Customers, is designed to narrow the distance between US GAAP rules and International Financial Reporting Standards (IFRS).</p><p>“We are going from a lot of . . . rules that are principles based, to more judgment, more estimates, as well as a lot of disclosure requirements,” says Eloise Wagner, partner at Ernst &amp; Young. “It is a big change.”</p><p>The software industry is set to be one of the most deeply affected. Operating under highly specific industry rules for when revenue can be recognised, and with many companies in the midst of a transition from upfront licence sales to a software subscription model, the move to an entirely new accounting regime will force complex changes.</p><p>The precise effects will depend on the fine print of each company’s contracts, Mr Tzuo said, many of them developed with older accounting rules in mind.</p><p>Under so-called “ramp” deals, for instance, customers pay more in the later years of a contract. But under the new rules, the revenue recognition will have to be spread evenly over the period, resulting in more sales being reported earlier. And companies that sell both hardware and software — often accounting for each element separately — will have to treat them as a single sale if they are judged to be part of a single IT system.</p><p>Microsoft has said the impact on its revenue will be material, as sales of Windows 10 licences, which are currently treated as a rateable licence fee spread over a number of years, are all recognised upfront.</p><p>Cloud software companies, meanwhile, could benefit by deferring more of their costs until future years.</p><p>With marketing and sales costs amounting to more than half of total revenues for some software-as-a-service (SaaS) companies, the impact on high-growth companies in particular could be significant, said Mr Tzuo. Salesforce, the biggest SaaS company, has said that it will delay the recognition of more of its sales commissions, something that will improve its reported profitability.</p><p>Even when the absolute numbers are not large, the impact may still be significant. Most SaaS companies operate at a loss or with very marginal profitability, making any boost to their bottom lines noteworthy.</p><p>Workday, the first SaaS company to adopt the new accounting rules earlier this year, said the change had lifted its pro-forma operating profit margin to 3.3 per cent in the latest financial year, compared with the 1.9 per cent it would have reported under the old rules.</p><p>Meanwhile, analysts and investors will have to be on the look out for idiosyncratic effects — and to make sure they do not mistake higher reported revenues for a real change in the underlying business. </p><p>Amazon has said that the new standard means that it will recognise revenue sooner when it sells electronic devices such as Kindles via non-Amazon stores, and will also recognise revenue sooner from the unused portion of gift cards. \n</p><footer>\n    <p>Copyright The Financial Times Limited 2017</p>\n    <p>© 2017 The Financial Times Ltd. All rights reserved. Please do not copy and paste FT articles and redistribute by email or post to the web.</p>\n</footer></body>',
		'fileName': 'FT_Uber_Amazon_'
	}, {
		'id': 'http://www.ft.com/thing/eaef2e2c-6c61-11e7-b9c7-15af748b60d0',
		'type': 'http://www.ft.com/ontology/content/Article',
		'bodyXML': '<body><ft-content type="http://www.ft.com/ontology/content/ImageSet" url="http://api.ft.com/content/a6652138-6c68-11e7-27a1-8235aeffcb99" data-embedded="true"></ft-content><p>Theresa May called on the BBC to pay men and women equally after the corporation published the names of its 96 stars paid more than £150,000 a year, exposing a wide gap between male and female broadcasters.</p>\n<p><ft-content type="http://www.ft.com/ontology/content/Article" url="http://api.ft.com/content/442502c6-442e-11e6-b22f-79eb4891c97d" title="www.ft.com">Chris Evans</ft-content>, the Radio 2 presenter and former <em>Top Gear </em>host, was revealed as the highest-paid broadcaster at the corporation, with a salary between £2.2m and £2.25m a year.</p>\n<p>The only other broadcaster paid more than £1m a year was <em>Match of the Day </em>presenter Gary Lineker, who received between £1.75m and £1.8m last year. </p>\n<p>The highest paid woman was <em>Strictly Come Dancing</em> presenter Claudia Winkleman, who was paid between £450,000 and £500,000. There were only 34 women in total, reviving arguments about a lack of gender balance at the corporation. Only Ms Winkleman and <em>One Show</em> presenter Alex Jones were in the top 10 pay brackets.</p>\n<p>“We’ve seen the way the BBC is paying women less for doing the same job,” the prime minister told LBC. “What’s important is that the BBC looks at the question of paying men and women the same for doing the same job.”</p>\n<p>----------------------------------------------------------<br/>Full list<br/>\n<ft-content type="http://www.ft.com/ontology/content/Article" url="http://api.ft.com/content/45024b54-6c69-11e7-b9c7-15af748b60d0">How much are the BBC’s top stars paid?</ft-content>\n<br/>----------------------------------------------------------</p>\n<p>Broadcaster Jane Garvey tweeted: “I’m looking forward to presenting @BBCWomansHour today. We’ll be discussing #GenderPayGap. As we’ve done since 1946. Going well, isn’t it?”</p>\n<p>Critics also pointed out that there was a pay gap between white presenters and those from minority ethnic backgrounds. The highest paid minority ethnic broadcasters were George Alagiah, Jason Mohammad and Trevor Nelson, each receiving between £250,000 and £300,000.</p>\n<ft-related type="http://www.ft.com/ontology/content/Article" url="http://api.ft.com/content/b490ff82-6184-11e7-91a7-502f7ee26895"><headline>BBC’s new chairman says stars ‘are not overpaid’\n</headline><media><ft-content type="http://www.ft.com/ontology/content/ImageSet" url="http://api.ft.com/content/5cbc1bd2-619a-11e7-1672-9d5d31f04eb8" data-embedded="true"></ft-content></media><intro><p>Sir David Clementi gives first interview as broadcaster prepares to disclose top pay</p></intro></ft-related>\n<p>Tony Hall, BBC director-general, said the corporation was more diverse on gender and ethnic diversity than the civil service and other broadcasters.</p>\n<p>He pointed to pay rises and promotions given to female presenters in the past four years, adding that of those promoted to jobs paying more than £150,000 since 2013, two-thirds were women, including the BBC political editor Laura Kuenssberg.</p>\n<p>Asked whether he feared legal action from female presenters following the release of the pay list, Lord Hall would only say that it was his job to manage the relationship with top talent. “We’ve made progress, but we recognise there is more to do and we are pushing further and faster than any other broadcaster.”</p>\n<p>The BBC was forced to disclose the salaries as part of its new royal charter agreement with the government.</p>\n<ft-content type="http://www.ft.com/ontology/content/Video" url="http://api.ft.com/content/794a1188-1cf2-421f-b185-60b1d3f6d5e8" data-embedded="true"></ft-content>\n<br/>\n\n\n<p>Under the agreement, salaries not funded directly by the licence fee, or those through independent production companies, are not included on the list. As a result, the salary of David Dimbleby, one of the best-known faces of the BBC, was not disclosed.</p>\n<p>“This is something we need to look at. Although the BBC says pay is going down, is that pay being hidden?” said Damian Collins, chair of the parliamentary select committee for culture, media and sport.</p>\n<ft-content type="http://www.ft.com/ontology/content/ImageSet" url="http://api.ft.com/content/f9fac8a4-6c75-11e7-218d-a464d62fd5e3" data-embedded="true"></ft-content>\n<p>The level of disclosure in next year’s list is likely to be scaled back because the broadcaster’s in-house production division, BBC Studios, will be spun out as a separate company. Presenters who appear on BBC shows produced by BBC Studios will not have to publish that element of their pay.</p>\n<p>Lord Hall said on Wednesday that the overall number of presenters earning more than £150,000 a year had fallen by 13 in the past year, and that the total bill for those earning over that threshold had fallen by £3.1m since last year, to £28.4m.</p>\n<p>He said he was “satisfied” with the list of people earning more than £150,000.</p>\n<p>There was awkwardness on display within the BBC throughout the day, as newsreaders and presenters had to interview their managers, and in some cases each other, about how much they earned, as the story dominated the corporation’s own news bulletins.</p>\n<p>Jeremy Vine, revealed to be paid more than £700,000, interviewed his boss James Purnell, asking how he “justified” paying him so much. “You’re a fantastic broadcaster,” Mr Purnell responded. </p>\n<ft-content type="http://www.ft.com/ontology/content/ImageSet" url="http://api.ft.com/content/032a18ea-6c7a-11e7-218d-a464d62fd5e3" data-embedded="true"></ft-content>\n<p>Later in the day, another <em>Today</em> presenter John Humphrys was asked by the BBC’s media editor Amol Rajan if he was worth his £600,000 to £650,000 a year salary and whether he would take a £200,000 pay cut to continue working for the corporation.</p>\n<p>“Would I chop my salary in half? I don’t know, maybe I would,” said Mr Humphrys. “The BBC hasn’t suggested that.</p>\n<p>“I’ve no idea if I am worth that amount of public money. What do I do on paper . . . nothing justifies that amount of money. If a doctor saves a person’s life or a fireman rushes into Grenfell tower . . . compared with that sort of thing I am not worth tuppence ha’penny.”</p>\n<p>After the interview, Mr Humphreys admitted to the Financial Times that the whole day had been “totally surreal”. He won support from some people for daring to put himself up for a grilling, while other BBC presenters kept their heads down. </p>\n<p>Andrew Marr, meanwhile, was at pains to point out that while he earns “£400,475 a year”, his salary has been coming down. “I now earn £139k a year less than I did two years ago,” he said. </p>\n\n<ft-content type="http://www.ft.com/ontology/content/ImageSet" url="http://api.ft.com/content/2f3aef44-6c71-11e7-27a1-8235aeffcb99" data-embedded="true"></ft-content>\n\n<p>The discrepancies between men and women working on the same programmes was widely noted. </p>\n<p>While Mr Humphrys received between £600,000 and £649,000 last year, Mishal Husain was paid less than half that amount. Her colleague Sarah Montague’s pay was not disclosed because she did not break through the £150,000-a-year threshold, possibly because she worked fewer shifts. </p>\n<p>The BBC said that making comparisons between presenters was “fraught with danger” because different people could be working different shift patterns, or doing extra work for other parts of the organisation. Mr Humphrys tops up his money from <em>Today</em> by fronting the quiz show <em>Mastermind</em>.</p>\n<p>One BBC presenter told the Financial Times that there was anger inside the corporation following the list’s publication. “It’s very upsetting,” the presenter said. “What is the government’s intention here? To make it much more difficult for the BBC.”</p>\n<p>Other senior journalists greeted the news with resignation, with one saying: “There were no great surprises here.”</p>\n\n\n\n\n<table class="data-table"><caption>The BBC’s highest-paid stars</caption>\n<tr><td colspan="2"><p>Chris Evans, £2.2m-£2.25m</p>\n<p>Gary Lineker £1.75m-£1.8m</p>\n<p>Graham Norton £850,000-£900,000</p>\n<p>Jeremy Vine £700,000-£750,000</p>\n<p>John Humphrys £600,000-£650,000</p>\n<p>Huw Edwards £550,000-£600,000</p>\n<p>Steve Wright £500,000-£550,000</p>\n<p>Claudia Winkleman £450,000-£500,000 </p>\n<p>Matt Baker £450,000-£500,000</p>\n<p>Andrew Marr £400,000-£450,000 </p>\n<p>Alan Shearer £400,000-£450,000</p>\n<p>Alex Jones £400,000-£450,000 </p>\n<p>Nicky Campbell £400,000-£450,000</p>\n<p>Stephen Nolan £400,000-£450,000</p>\n</td>\n</tr>\n</table>\n\n\n</body>',
		'title': 'Theresa May criticises BBC as star salaries reveal gender gap',
		'alternativeTitles': { 'promotionalTitle': 'May criticises BBC as star pay reveals gender gap' },
		'standfirst': 'Table of broadcaster’s staff earning over £150,000 sheds harsh light on inequality',
		'alternativeStandfirsts': {},
		'byline': 'David Bond, Media Correspondent',
		'firstPublishedDate': '2017-07-19T10:00:19.000Z',
		'publishedDate': '2017-07-19T18:33:07.000Z',
		'requestUrl': 'http://api.ft.com/content/eaef2e2c-6c61-11e7-b9c7-15af748b60d0',
		'brands': ['http://api.ft.com/things/dbb0bdae-1f0c-11e4-b0cb-b2227cce2b54'],
		'mainImage': { 'id': 'http://api.ft.com/content/a6652138-6c68-11e7-27a1-8235aeffcb99' },
		'alternativeImages': {},
		'standout': { 'editorsChoice': false, 'exclusive': false, 'scoop': false },
		'publishReference': 'tid_t7p7iksfn6',
		'canBeDistributed': 'yes',
		'canBeSyndicated': 'yes',
		'webUrl': 'http://www.ft.com/cms/s/eaef2e2c-6c61-11e7-b9c7-15af748b60d0.html',
		'contentType': 'article',
		'extension': 'docx',
		'wordCount': 1046,
		'__wordCount': 1046,
		'bodyXML__CLEAN': '<body><header>\n    <h1>Theresa May criticises BBC as star salaries reveal gender gap</h1>\n    <p>19 July 2017</p>\n    <p><strong style="font-weight: bold;">David Bond, Media Correspondent</strong></p>\n    <p><strong style="font-weight: bold">Source: FT.com</strong></p>\n    <p><strong style="font-weight: bold;">Word count: 1046</strong></p>\n    <p><strong style="font-weight: bold;">Link To FT.com: <a href="http://www.ft.com/cms/s/eaef2e2c-6c61-11e7-b9c7-15af748b60d0.html">http://www.ft.com/cms/s/eaef2e2c-6c61-11e7-b9c7-15af748b60d0.html</a></strong></p>\n    </header><p>Theresa May called on the BBC to pay men and women equally after the corporation published the names of its 96 stars paid more than £150,000 a year, exposing a wide gap between male and female broadcasters.</p><p>Chris Evans, the Radio 2 presenter and former <em>Top Gear </em>host, was revealed as the highest-paid broadcaster at the corporation, with a salary between £2.2m and £2.25m a year.</p><p>The only other broadcaster paid more than £1m a year was <em>Match of the Day </em>presenter Gary Lineker, who received between £1.75m and £1.8m last year. </p><p>The highest paid woman was <em>Strictly Come Dancing</em> presenter Claudia Winkleman, who was paid between £450,000 and £500,000. There were only 34 women in total, reviving arguments about a lack of gender balance at the corporation. Only Ms Winkleman and <em>One Show</em> presenter Alex Jones were in the top 10 pay brackets.</p><p>“We’ve seen the way the BBC is paying women less for doing the same job,” the prime minister told LBC. “What’s important is that the BBC looks at the question of paying men and women the same for doing the same job.”</p><p>----------------------------------------------------------<br/>Full list<br/>\nHow much are the BBC’s top stars paid?\n<br/>----------------------------------------------------------</p><p>Broadcaster Jane Garvey tweeted: “I’m looking forward to presenting @BBCWomansHour today. We’ll be discussing #GenderPayGap. As we’ve done since 1946. Going well, isn’t it?”</p><p>Critics also pointed out that there was a pay gap between white presenters and those from minority ethnic backgrounds. The highest paid minority ethnic broadcasters were George Alagiah, Jason Mohammad and Trevor Nelson, each receiving between £250,000 and £300,000.</p><p>Tony Hall, BBC director-general, said the corporation was more diverse on gender and ethnic diversity than the civil service and other broadcasters.</p><p>He pointed to pay rises and promotions given to female presenters in the past four years, adding that of those promoted to jobs paying more than £150,000 since 2013, two-thirds were women, including the BBC political editor Laura Kuenssberg.</p><p>Asked whether he feared legal action from female presenters following the release of the pay list, Lord Hall would only say that it was his job to manage the relationship with top talent. “We’ve made progress, but we recognise there is more to do and we are pushing further and faster than any other broadcaster.”</p><p>The BBC was forced to disclose the salaries as part of its new royal charter agreement with the government.</p><br/><p>Under the agreement, salaries not funded directly by the licence fee, or those through independent production companies, are not included on the list. As a result, the salary of David Dimbleby, one of the best-known faces of the BBC, was not disclosed.</p><p>“This is something we need to look at. Although the BBC says pay is going down, is that pay being hidden?” said Damian Collins, chair of the parliamentary select committee for culture, media and sport.</p><p>The level of disclosure in next year’s list is likely to be scaled back because the broadcaster’s in-house production division, BBC Studios, will be spun out as a separate company. Presenters who appear on BBC shows produced by BBC Studios will not have to publish that element of their pay.</p><p>Lord Hall said on Wednesday that the overall number of presenters earning more than £150,000 a year had fallen by 13 in the past year, and that the total bill for those earning over that threshold had fallen by £3.1m since last year, to £28.4m.</p><p>He said he was “satisfied” with the list of people earning more than £150,000.</p><p>There was awkwardness on display within the BBC throughout the day, as newsreaders and presenters had to interview their managers, and in some cases each other, about how much they earned, as the story dominated the corporation’s own news bulletins.</p><p>Jeremy Vine, revealed to be paid more than £700,000, interviewed his boss James Purnell, asking how he “justified” paying him so much. “You’re a fantastic broadcaster,” Mr Purnell responded. </p><p>Later in the day, another <em>Today</em> presenter John Humphrys was asked by the BBC’s media editor Amol Rajan if he was worth his £600,000 to £650,000 a year salary and whether he would take a £200,000 pay cut to continue working for the corporation.</p><p>“Would I chop my salary in half? I don’t know, maybe I would,” said Mr Humphrys. “The BBC hasn’t suggested that.</p><p>“I’ve no idea if I am worth that amount of public money. What do I do on paper . . . nothing justifies that amount of money. If a doctor saves a person’s life or a fireman rushes into Grenfell tower . . . compared with that sort of thing I am not worth tuppence ha’penny.”</p><p>After the interview, Mr Humphreys admitted to the Financial Times that the whole day had been “totally surreal”. He won support from some people for daring to put himself up for a grilling, while other BBC presenters kept their heads down. </p><p>Andrew Marr, meanwhile, was at pains to point out that while he earns “£400,475 a year”, his salary has been coming down. “I now earn £139k a year less than I did two years ago,” he said. </p><p>The discrepancies between men and women working on the same programmes was widely noted. </p><p>While Mr Humphrys received between £600,000 and £649,000 last year, Mishal Husain was paid less than half that amount. Her colleague Sarah Montague’s pay was not disclosed because she did not break through the £150,000-a-year threshold, possibly because she worked fewer shifts. </p><p>The BBC said that making comparisons between presenters was “fraught with danger” because different people could be working different shift patterns, or doing extra work for other parts of the organisation. Mr Humphrys tops up his money from <em>Today</em> by fronting the quiz show <em>Mastermind</em>.</p><p>One BBC presenter told the Financial Times that there was anger inside the corporation following the list’s publication. “It’s very upsetting,” the presenter said. “What is the government’s intention here? To make it much more difficult for the BBC.”</p><p>Other senior journalists greeted the news with resignation, with one saying: “There were no great surprises here.”</p><table class="data-table"><caption>The BBC’s highest-paid stars</caption>\n<tr><td colspan="2"><p>Chris Evans, £2.2m-£2.25m</p>\n<p>Gary Lineker £1.75m-£1.8m</p>\n<p>Graham Norton £850,000-£900,000</p>\n<p>Jeremy Vine £700,000-£750,000</p>\n<p>John Humphrys £600,000-£650,000</p>\n<p>Huw Edwards £550,000-£600,000</p>\n<p>Steve Wright £500,000-£550,000</p>\n<p>Claudia Winkleman £450,000-£500,000 </p>\n<p>Matt Baker £450,000-£500,000</p>\n<p>Andrew Marr £400,000-£450,000 </p>\n<p>Alan Shearer £400,000-£450,000</p>\n<p>Alex Jones £400,000-£450,000 </p>\n<p>Nicky Campbell £400,000-£450,000</p>\n<p>Stephen Nolan £400,000-£450,000</p>\n</td>\n</tr>\n</table><footer>\n    <p>Copyright The Financial Times Limited 2017</p>\n    <p>© 2017 The Financial Times Ltd. All rights reserved. Please do not copy and paste FT articles and redistribute by email or post to the web.</p>\n</footer></body>',
		'fileName': 'FT_Theresa_May_'
	} ];

	const contentItemsMap = contentItems.reduce((acc, item) => {
		acc[item.id] = item;

		if (item.id.includes('/')) {
			acc[item.id.split('/').pop()] = item;
		}

		return acc;
	}, {});

	require(path.resolve(`${FIXTURES_DIRECTORY}/massive`))();

	describe('default call', function () {
		let next;
		let getHistoryByContractID;
		let req;
		let res;
		let user_id;

		afterEach(function () {
		});

		beforeEach(function () {
			user_id = '8ef593a8-eef6-448c-8560-9ca8cdca80a5';

			getHistoryByContractID = sinon.stub().resolves({
				items: items,
				total: items.length
			});

			underTest = proxyquire('../../../server/controllers/history', {
				'../lib/get-content': sinon.stub().resolves(contentItemsMap),
				'../lib/get-history-by-contract-id': getHistoryByContractID
			});

			req = httpMocks.createRequest({
				'eventEmitter': EventEmitter,
				'connection': new EventEmitter(),
				'headers': {
					'ft-real-url': 'https://www.ft.com/syndication/history',
					'ft-real-path': '/syndication/history',
					'ft-vanity-url': '/syndication/history',
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
				'originalUrl': '/syndication/history',
				'params': {},
				'path': '/syndication/history',
				'protocol': 'http',
				'query': {

				},
				'url': '/syndication/history'
			});

			res = httpMocks.createResponse({
				req,
				writableStream: WritableStream
			});

			res.sendStatus = sinon.stub();
			res.status = sinon.stub();
			res.json = sinon.stub();
			next = sinon.stub();

			res.locals = {
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

		it('getHistoryByContractID', async function () {
			await underTest(req, res, next);

			expect(getHistoryByContractID).to.be.calledWith({
				contract_id: res.locals.syndication_contract.id
			});
		});

		it('response: status', async function () {
			await underTest(req, res, next);

			expect(res.status).to.be.calledWith(200);
		});

		it('response: body', async function () {
			await underTest(req, res, next);

			expect(res.json).to.be.calledWith({
				items: items,
				total: items.length
			});
		});

		it('next', async function () {
			await underTest(req, res, next);

			expect(next).to.have.been.called;
		});
	});

	describe('show only current user\'s items', function () {
		let filteredItems;
		let getHistoryByContractID;
		let next;
		let req;
		let res;
		let user_id;

		afterEach(function () {
			filteredItems = null;
		});

		beforeEach(function () {
			user_id = '8ef593a8-eef6-448c-8560-9ca8cdca80a5';

			filteredItems = items.filter(item => item.user_id === user_id);

			getHistoryByContractID = sinon.stub().resolves({
				items: filteredItems,
				total: filteredItems.length
			});

			underTest = proxyquire('../../../server/controllers/history', {
				'../lib/get-content': sinon.stub().resolves(contentItemsMap),
				'../lib/get-history-by-contract-id': getHistoryByContractID
			});

			req = httpMocks.createRequest({
				'eventEmitter': EventEmitter,
				'connection': new EventEmitter(),
				'headers': {
					'ft-real-url': 'https://www.ft.com/syndication/history?show=mine',
					'ft-real-path': '/syndication/history?show=mine',
					'ft-vanity-url': '/syndication/history?show=mine',
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
				'originalUrl': '/syndication/history?show=mine',
				'params': {},
				'path': '/syndication/history',
				'protocol': 'http',
				'query': {
					show: 'mine'
				},
				'url': '/syndication/history?show=mine'
			});

			res = httpMocks.createResponse({
				req,
				writableStream: WritableStream
			});

			res.sendStatus = sinon.stub();
			res.status = sinon.stub();
			res.json = sinon.stub();
			next = sinon.stub();

			res.locals = {
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
					user_id
				},
				userUuid: user_id
			};

			next = sinon.stub();
		});

		it('getHistoryByContractID', async function () {
			await underTest(req, res, next);

			expect(getHistoryByContractID).to.be.calledWith({
				contract_id: res.locals.syndication_contract.id,
				user_id: user_id
			});
		});

		it('response: status', async function () {
			await underTest(req, res, next);

			expect(res.status).to.be.calledWith(200);
		});

		it('response: body', async function () {
			await underTest(req, res, next);

			expect(res.json).to.be.calledWith({
				items: filteredItems,
				total: filteredItems.length
			});
		});

		it('next', async function () {
			await underTest(req, res, next);

			expect(next).to.have.been.called;
		});
	});

	describe('show only saved items', function () {
		let filteredItems;
		let getHistoryByContractID;
		let next;
		let req;
		let res;
		let user_id;

		afterEach(function () {
			filteredItems = null;
		});

		beforeEach(function () {
			user_id = '8ef593a8-eef6-448c-8560-9ca8cdca80a5';

			filteredItems = items.filter(item => item.state === 'saved');

			getHistoryByContractID = sinon.stub().resolves({
				items: filteredItems,
				total: filteredItems.length
			});

			underTest = proxyquire('../../../server/controllers/history', {
				'../lib/get-content': sinon.stub().resolves(contentItemsMap),
				'../lib/get-history-by-contract-id': getHistoryByContractID
			});

			req = httpMocks.createRequest({
				'eventEmitter': EventEmitter,
				'connection': new EventEmitter(),
				'headers': {
					'ft-real-url': 'https://www.ft.com/syndication/history?type=saved',
					'ft-real-path': '/syndication/history?type=saved',
					'ft-vanity-url': '/syndication/history?type=saved',
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
				'originalUrl': '/syndication/history?type=saved',
				'params': {},
				'path': '/syndication/history',
				'protocol': 'http',
				'query': {
					type: 'saved'
				},
				'url': '/syndication/history?type=saved'
			});

			res = httpMocks.createResponse({
				req,
				writableStream: WritableStream
			});

			res.sendStatus = sinon.stub();
			res.status = sinon.stub();
			res.json = sinon.stub();
			next = sinon.stub();

			res.locals = {
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
					user_id
				},
				userUuid: user_id
			};

			next = sinon.stub();
		});

		it('getHistoryByContractID', async function () {
			await underTest(req, res, next);

			expect(getHistoryByContractID).to.be.calledWith({
				contract_id: res.locals.syndication_contract.id,
				type: 'saved'
			});
		});

		it('response: status', async function () {
			await underTest(req, res, next);

			expect(res.status).to.be.calledWith(200);
		});

		it('response: body', async function () {
			await underTest(req, res, next);

			expect(res.json).to.be.calledWith({
				items: filteredItems,
				total: filteredItems.length
			});
		});

		it('next', async function () {
			await underTest(req, res, next);

			expect(next).to.have.been.called;
		});
	});

	describe('show only downloaded items', function () {
		let filteredItems;
		let getHistoryByContractID;
		let next;
		let req;
		let res;
		let user_id;

		afterEach(function () {
			filteredItems = null;
		});

		beforeEach(function () {
			user_id = '8ef593a8-eef6-448c-8560-9ca8cdca80a5';

			filteredItems = items.filter(item => item.state !== 'saved');

			getHistoryByContractID = sinon.stub().resolves({
				items: filteredItems,
				total: filteredItems.length
			});

			underTest = proxyquire('../../../server/controllers/history', {
				'../lib/get-content': sinon.stub().resolves(contentItemsMap),
				'../lib/get-history-by-contract-id': getHistoryByContractID
			});

			req = httpMocks.createRequest({
				'eventEmitter': EventEmitter,
				'connection': new EventEmitter(),
				'headers': {
					'ft-real-url': 'https://www.ft.com/syndication/history?type=downloads',
					'ft-real-path': '/syndication/history?type=downloads',
					'ft-vanity-url': '/syndication/history?type=downloads',
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
				'originalUrl': '/syndication/history?type=downloads',
				'params': {},
				'path': '/syndication/history',
				'protocol': 'http',
				'query': {
					type: 'downloads'
				},
				'url': '/syndication/history?type=downloads'
			});

			res = httpMocks.createResponse({
				req,
				writableStream: WritableStream
			});

			res.sendStatus = sinon.stub();
			res.status = sinon.stub();
			res.json = sinon.stub();
			next = sinon.stub();

			res.locals = {
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
					user_id
				},
				userUuid: user_id
			};

			next = sinon.stub();
		});

		it('getHistoryByContractID', async function () {
			await underTest(req, res, next);

			expect(getHistoryByContractID).to.be.calledWith({
				contract_id: res.locals.syndication_contract.id,
				type: 'downloads'
			});
		});

		it('response: status', async function () {
			await underTest(req, res, next);

			expect(res.status).to.be.calledWith(200);
		});

		it('response: body', async function () {
			await underTest(req, res, next);

			expect(res.json).to.be.calledWith({
				items: filteredItems,
				total: filteredItems.length
			});
		});

		it('next', async function () {
			await underTest(req, res, next);

			expect(next).to.have.been.called;
		});
	});
});
