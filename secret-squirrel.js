module.exports = {
    files: {
        allow: [
            'server\/views\/partial\/.*?\.hbs',
            'test\/fixtures\/.*'
//            'server/views/partial/article_metadata_ft.html.hbs',
//            'server/views/partial/article_metadata_hd.html.hbs',
//            'test/fixtures/article.docx',
//            'test/fixtures/article.html',
//            'test/fixtures/article.plain',
//            'test/fixtures/pandoc_stub',
//            'test/fixtures/video-small.mp4'
        ],
        allowOverrides: []
    },
    strings: {
        deny: [],
        denyOverrides: [
            'http(?:s?):\/\/.*',
            '\/content\/.*',
            // content UUIDs
            'b59dff10-3f7e-11e7-9d56-25f963e998b2',
            'c7923fba-1d31-39fd-82f0-ba1822ef20d2',
            '80d634ea-fa2b-46b5-886f-1418c6445182',
            'd7bf1822-ec58-4a8e-a669-5cbcc0d6a1b2',
            'dbb0bdae-1f0c-11e4-b0cb-b2227cce2b54',
            'd0842750-9903-4bf9-2ee7-f3d98afabc1e',
            '16a642f4-3f84-11e7-1cd0-1ef14f87a411',
            'faf86fbc-0009-11df-8626-00144feabdc0',
            '34b704a0-54d7-11e7-9fed-c19e2700005f',
            'b4fac748-a2b1-4b7d-8e1f-03ba743ff717',
            '00004ffc-004e-50ad-0337-456ae1b1861c',
            '6ce05235-c102-48b9-a886-95dbd7f40419',
            'de2390cd-46a1-4c58-2914-f5f50e13f766',
            'cada14c4-d366-11e6-b06b-680c49b4b4c0',
            '302d79cc-e6e3-11e5-a09b-1f8b0d268c39',
            '2ece7d55-f2c5-30d5-8119-df841dfb64ea',
            '048f418c-2487-11e7-a34a-538b4cb30025',
            '16e86360-4096-11e7-1cd0-1ef14f87a411',
            '2e055d50-2453-11e7-18f7-426d3ab9a15f',
            '6b24d1b8-1ac9-11e7-bcac-6d03d067f81f',
            'fakenews-fa2b-46b5-886f-1418c6445182',
            'fakenews-3f7e-11e7-9d56-25f963e998b2',
            'fakenews-1d31-39fd-82f0-ba1822ef20d2',
            'fakenews-ec58-4a8e-a669-5cbcc0d6a1b2'
        ]
    }
};
