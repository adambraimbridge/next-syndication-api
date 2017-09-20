'use strict';

const path = require('path');

const { expect } = require('chai');

const {
	FORMAT_ARTICLE_CLEAN_ELEMENTS,
	FORMAT_ARTICLE_STRIP_ELEMENTS,
	TEST: { FIXTURES_DIRECTORY }
} = require('config');

const CHECK_NO_ELEMENTS = FORMAT_ARTICLE_CLEAN_ELEMENTS.concat(FORMAT_ARTICLE_STRIP_ELEMENTS);

const underTest = require('../../../server/lib/format-article-xml');

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

const TRICK_LINT = '';

describe(MODULE_ID, function () {
	let xmlPre = `${TRICK_LINT}<body>
<figure class="n-content-image">
<img src="http://com.ft.imagepublish.prod.s3.amazonaws.com/ecdc60f0-97dc-11e7-a652-cde3f882dd7b" alt="" role="presentation" width="2048" height="1152" data-copyright="© Christopher de Lorenzo">
<figcaption class="n-content-image__caption">© Christopher de Lorenzo</figcaption>
</figure>
<p>Cities and big tech companies usually do not get along very well. Just look at San Francisco or Seattle — many locals love nothing more than a good gripe against Google or Uber or Amazon.</p>
<p>It’s been curious, then, to watch <a href="/content/eb3642da-94b1-11e7-a9e6-11d2f0ebb7f0">cities rush forward after Amazon</a> said it was looking for a site to build a second headquarters in North America. Mayors from Pittsburgh to Chicago to Memphis have jumped on Twitter and on the phone to woo Amazon, promising their constituents they will work hard to win the company’s favour.</p>
<p>The prize is certainly vast — Amazon has said it will spend at least $5bn to build the new headquarters, which will be home to some 50,000 employees.</p>
<p>In Seattle, Amazon’s hometown, however, the company’s presence is somewhat controversial. Any visitor is immediately struck by the scale of Amazon’s urban campus, some 33 buildings right in the heart of town. The buildings are not walled off, but there is a noticeable change in atmosphere as you enter Amazon-land: the sidewalks get cleaner, the people have fewer tattoos and fancy fitness studios become more frequent.</p>
<p>As the campus has ballooned from 20,000 people two years ago to more than 40,000 people today, its footprint has become a sore point. Many workers live nearby — one in five walks to work — heightening the sense that downtown Seattle has become a company town.</p>
<p>Suddenly Seattle’s conversations about rent control, a practice long banned in Washington state, have become serious. Seattle even elected its first socialist city council member in many decades in 2014, who campaigned in part on concerns about affordable housing and gentrification. None of this used to happen in the city, long known as a low-tax, business-friendly jurisdiction. (Washington’s low taxes were a key reason why <a href="https://www.ft.com/topics/people/Jeff_Bezos">Jeff Bezos</a> set up shop there all those years ago.)</p>
<p>Amazon has not been totally blind to these concerns. As if to mute its presence, the company has avoided any big “Amazon” signs on building exteriors. It is also creating a botanical garden in the centre of Seattle, housed in three greenhouse spheres — although these will not be fully open to the public. Instead they will be used mostly for corporate meetings.</p>
<p>A similar frisson with big tech has long been felt in San Francisco, where locals harbour deep resentment for the hordes of tech workers that have flooded the city. For years, irritated San Franciscans staged <a href="https://www.wired.com/2016/02/sfs-tech-bus-problem-isnt-about-buses-its-about-housing/">protests</a> at the bus stops where Google’s fleet of big white commuter buses picked up city-dwelling tech workers with their lattes and even their dogs, to ferry them to company headquarters in Silicon Valley. These protests have died down recently, partly because soaring rents in the city have priced out many former and would-be protesters.</p>
<p>The dispute between cities and the tech corporations boils down to the question of what it means for companies to be good corporate citizens. The inefficiencies of government mean that cities are often unable to cope with rapid change, even while an increased tax base may help fill city coffers. Companies must then try to fill in infrastructure gaps themselves, but often these efforts draw the ire of the public, which perceives them as only benefiting the corporations and their staff.</p>
<p>While big tech companies are trying to manage the backlash from the cities they inhabit, a growing number of start-ups are trying to design <a href="http://uk.businessinsider.com/silicon-valley-is-building-utopian-cities-2016-6?r=US&amp;IR=T">tech-utopian cities</a> of the future. These groups are working on 3D-printed buildings, trains that move at close to the speed of sound and new systems of banking and taxation that could replace the role of government as we know it.</p>
<p>The concept of a “city in a box” is often tossed around, as if these urban visions will spring forth fully formed once the technology is perfected. But before they invent the cities of the future, tech companies must first learn how to live within the cities of today.</p>
<p><em>Leslie Hook is the FT’s San Francisco correspondent</em></p>
<p><em>Illustration by Christopher de Lorenzo</em></p>
</body>`;

	let xmlPost = `${TRICK_LINT}<body xmlns="http://www.w3.org/1999/xhtml"><p>Cities and big tech companies usually do not get along very well. Just look at San Francisco or Seattle — many locals love nothing more than a good gripe against Google or Uber or Amazon.</p><p>It’s been curious, then, to watch cities rush forward after Amazon said it was looking for a site to build a second headquarters in North America. Mayors from Pittsburgh to Chicago to Memphis have jumped on Twitter and on the phone to woo Amazon, promising their constituents they will work hard to win the company’s favour.</p><p>The prize is certainly vast — Amazon has said it will spend at least $5bn to build the new headquarters, which will be home to some 50,000 employees.</p><p>In Seattle, Amazon’s hometown, however, the company’s presence is somewhat controversial. Any visitor is immediately struck by the scale of Amazon’s urban campus, some 33 buildings right in the heart of town. The buildings are not walled off, but there is a noticeable change in atmosphere as you enter Amazon-land: the sidewalks get cleaner, the people have fewer tattoos and fancy fitness studios become more frequent.</p><p>As the campus has ballooned from 20,000 people two years ago to more than 40,000 people today, its footprint has become a sore point. Many workers live nearby — one in five walks to work — heightening the sense that downtown Seattle has become a company town.</p><p>Suddenly Seattle’s conversations about rent control, a practice long banned in Washington state, have become serious. Seattle even elected its first socialist city council member in many decades in 2014, who campaigned in part on concerns about affordable housing and gentrification. None of this used to happen in the city, long known as a low-tax, business-friendly jurisdiction. (Washington’s low taxes were a key reason why Jeff Bezos set up shop there all those years ago.)</p><p>Amazon has not been totally blind to these concerns. As if to mute its presence, the company has avoided any big “Amazon” signs on building exteriors. It is also creating a botanical garden in the centre of Seattle, housed in three greenhouse spheres — although these will not be fully open to the public. Instead they will be used mostly for corporate meetings.</p><p>A similar frisson with big tech has long been felt in San Francisco, where locals harbour deep resentment for the hordes of tech workers that have flooded the city. For years, irritated San Franciscans staged protests at the bus stops where Google’s fleet of big white commuter buses picked up city-dwelling tech workers with their lattes and even their dogs, to ferry them to company headquarters in Silicon Valley. These protests have died down recently, partly because soaring rents in the city have priced out many former and would-be protesters.</p><p>The dispute between cities and the tech corporations boils down to the question of what it means for companies to be good corporate citizens. The inefficiencies of government mean that cities are often unable to cope with rapid change, even while an increased tax base may help fill city coffers. Companies must then try to fill in infrastructure gaps themselves, but often these efforts draw the ire of the public, which perceives them as only benefiting the corporations and their staff.</p><p>While big tech companies are trying to manage the backlash from the cities they inhabit, a growing number of start-ups are trying to design tech-utopian cities of the future. These groups are working on 3D-printed buildings, trains that move at close to the speed of sound and new systems of banking and taxation that could replace the role of government as we know it.</p><p>The concept of a “city in a box” is often tossed around, as if these urban visions will spring forth fully formed once the technology is perfected. But before they invent the cities of the future, tech companies must first learn how to live within the cities of today.</p><p><em>Leslie Hook is the FT’s San Francisco correspondent</em></p><p><em>Illustration by Christopher de Lorenzo</em></p></body>`;

	it('returns a xmldom.dom.Document instance', function () {
		expect(underTest(xmlPre).constructor.name).to.equal('Document');
	});

	it(`returns a single line with all ${CHECK_NO_ELEMENTS.map(el => `<${el} />`).join(', ')} elements removed and/or stripped`, function () {
		expect(underTest(xmlPre).toString().trim()).to.equal(xmlPost);
	});

	[
		'42ad255a-99f9-11e7-b83c-9588e51488a0',
		'ef4c49fe-980e-11e7-b83c-9588e51488a0',
		'b16fce7e-3c92-48a3-ace0-d1af3fce71af',
		'a1af0574-eafb-41bd-aa4f-59aa2cd084c2',
		'98b46b5f-17d3-40c2-8eaa-082df70c5f01',
		'93991a3c-0436-41bb-863e-61242e09859c'
	].forEach(contentId => {
		describe(`Testing content#${contentId}`, function() {
			const content = require(path.resolve(`${FIXTURES_DIRECTORY}/content/${contentId}.json`));

			const doc = underTest(`<body>${content.bodyHTML}</body>`);

			it('doc should be an xmldom.dom.Document instance', function () {
				expect(doc.constructor.name).to.equal('Document');
			});

			CHECK_NO_ELEMENTS.forEach(tagName => {
				it(`doc should not contain any <${tagName} /> elements`, function () {
					expect(doc.getElementsByTagName(tagName)).to.have.property('length').and.to.equal(0);
				});
			});
		});
	});
});
