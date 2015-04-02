var path = require('path'),
    fs = require('fs'),
    sinon = require('sinon'),
    HtmlDiffer = require('html-differ').HtmlDiffer,
    htmlDiffer = new HtmlDiffer(),
    logger = require('html-differ/lib/logger'),
    reporters = require('../../lib/reporters');

var input = [
    {
        path: 'example/blocks/block1/__elem1',
        actual: 'No deps file block1__elem1_mod1.deps.js',
        expected: { block: 'i-bem', elems: [ 'dom', 'html', 'i18n' ] }
    },
    {
        path: 'example/blocks/block1/__elem1/block1__elem1_mod2.deps.js',
        actual: {},
        expected: { block: 'i-bem' }
    },
    {
        path: 'example/blocks/block1/_mod1/block1_mod1.deps.js',
        actual: { block: 'i-bem', elems: [ 'html' ] },
        expected: { block: 'i-bem', elems: [ 'html', 'i18n' ] }
    }
];

describe('reporters', function () {
    describe('flat', function () {
        beforeEach(function () {
            sinon.stub(process.stdout, 'write');
        });

        afterEach(function () {
            process.stdout.write.restore();
        });

        it('must report BEM errors', function () {
            var output = require('./fixtures/bem-errors');

            reporters.mk('flat').write(input);
            process.stdout.write.lastCall.args[0].must.be.equal(output);
        });

        it('must report one BEM error', function () {
            var output = require('./fixtures/one-bem-error');

            reporters.mk('flat').write([input[0]]);
            process.stdout.write.lastCall.args[0].must.be.equal(output);
        });

        it('must NOT report BEM errors', function () {
            var output = 'No BEM errors.\n';

            reporters.mk('flat').write([]);
            process.stdout.write.lastCall.args[0].must.be.equal(output);
        });
    });

    describe('html', function () {
        function assertHtmlDiff(stub, output) {
            var html = stub.lastCall.args[1],
                diff = htmlDiffer.diffHtml(html, output);

            logger.logDiffText(diff, { charsAroundDiff: 40 });
            htmlDiffer.isEqual(html, output).must.be(true);
        }

        beforeEach(function () {
            sinon.stub(fs, 'writeFileSync');
        });

        afterEach(function () {
            fs.writeFileSync.restore();
        });

        it('must report BEM errors', function () {
            var output = fs.readFileSync(path.join(__dirname, 'fixtures/bem-errors.html'), 'utf-8');

            reporters.mk('html').write(input);
            assertHtmlDiff(fs.writeFileSync, output);
        });

        it('must NOT report BEM errors', function () {
            var output = fs.readFileSync(path.join(__dirname, 'fixtures/no-bem-errors.html'), 'utf-8');

            reporters.mk('html').write([]);
            assertHtmlDiff(fs.writeFileSync, output);
        });
    });
});
