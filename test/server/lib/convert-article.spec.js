'use strict';

const fs = require('fs');
const path = require('path');

const { expect } = require('chai');

const { TEST: { FIXTURES_DIRECTORY } } = require('config');

const underTest = require('../../../server/lib/convert-article');

const MODULE_ID = path.relative(`${process.cwd()}/test`, module.id) || require(path.resolve('./package.json')).name;

describe(MODULE_ID, function () {
    const content = require('../../fixtures/b59dff10-3f7e-11e7-9d56-25f963e998b2.json');

    [
        'docx',
        'html',
        'plain'
    ].forEach(targetFormat => {
        describe(`Converting to: ${targetFormat}`, function () {

            it('returns a Buffer of the converted Article', async function () {
                const res = await underTest({
                    source: content.bodyXML__CLEAN,
                    sourceFormat: 'html',
                    targetFormat
                });

                expect(res).to.be.an.instanceOf(Buffer);
            });

            it('the content should be correct', async function () {
                const expected = await underTest({
                    source: content.bodyXML__CLEAN,
                    sourceFormat: 'html',
                    targetFormat
                });

                const actual = fs.readFileSync(path.resolve(`${FIXTURES_DIRECTORY}/article.${targetFormat}`));

                expect(expected.equals(actual)).to.be.true;
            });

        });
    });
});
