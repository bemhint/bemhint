var DepsChecker = require('../../../lib/rules/deps-checker'),
    depsChecker = new DepsChecker();

describe('deps-checker', function () {
    describe('utils', function () {
        describe('actual deps', function () {
            it('must get block \'i-bem\' given as String', function () {
                depsChecker._getActualDeps({ mustDeps: 'i-bem' }).must.be.eql({ block: 'i-bem' });
            });

            it('must get block \'i-bem\' given as Object', function () {
                depsChecker._getActualDeps({ mustDeps: { block: 'i-bem' } }).must.be.eql({ block: 'i-bem' });
            });

            it('must get block \'i-bem\' and elem given as String', function () {
                var input = { mustDeps: { block: 'i-bem', elem: 'dom' } },
                    output = { block: 'i-bem', elems: ['dom'] };

                depsChecker._getActualDeps(input).must.be.eql(output);
            });

            it('must get block \'i-bem\' and elem given as Object', function () {
                var input = { mustDeps: { block: 'i-bem', elem: { name: 'dom' } } },
                    output = { block: 'i-bem', elems: ['dom'] };

                depsChecker._getActualDeps(input).must.be.eql(output);
            });

            it('must get block \'i-bem\' and NOT get elem given as Object', function () {
                var input = { mustDeps: { block: 'i-bem', elem: { val: 'blah' } } },
                    output = { block: 'i-bem' };

                depsChecker._getActualDeps(input).must.be.eql(output);
            });

            it('must get block \'i-bem\' and NOT get elem given as Array', function () {
                var input = { mustDeps: { block: 'i-bem', elem: ['dom', 'html'] } },
                    output = { block: 'i-bem' };

                depsChecker._getActualDeps(input).must.be.eql(output);
            });

            it('must get block \'i-bem\' and get elems given as Array', function () {
                var input = { mustDeps: { block: 'i-bem', elems: ['dom', 'html'] } },
                    output = { block: 'i-bem', elems: ['dom', 'html'] };

                depsChecker._getActualDeps(input).must.be.eql(output);
            });

            it('must get block \'i-bem\' and get elems given as String', function () {
                var input = { mustDeps: { block: 'i-bem', elems: 'dom' } },
                    output = { block: 'i-bem', elems: ['dom'] };

                depsChecker._getActualDeps(input).must.be.eql(output);
            });

            it('must get block \'i-bem\' and get elems given as Array of Objects', function () {
                var input = { mustDeps: { block: 'i-bem', elems: [{ name: 'dom' }, { name: 'html' }] } },
                    output = { block: 'i-bem', elems: ['dom', 'html'] };

                depsChecker._getActualDeps(input).must.be.eql(output);
            });

            it('must get block \'i-bem\' and NOT get elems given as Array of Objects', function () {
                var input = { mustDeps: { block: 'i-bem', elems: [{ val: 'blah' }, ['blah']] } },
                    output = { block: 'i-bem' };

                depsChecker._getActualDeps(input).must.be.eql(output);
            });

            it('must get \'i-bem\' deps from deps given as Array', function () {
                var input = [
                        { tech: 'js', mustDeps: [] },
                        { mustDeps: [{ block: 'blah' }, { block: 'i-bem', elems: ['dom'] }] }
                    ],
                    output = { block: 'i-bem', elems: ['dom'] };

                depsChecker._getActualDeps(input).must.be.eql(output);
            });
        });

        describe('get expected deps', function () {
            it('must NOT get deps', function () {
                var input = {};

                depsChecker._getExpectedDeps(input.js, input.bemhtml).must.be.eql({});
            });

            it('must get block \'i-bem\'', function () {
                var input = { js: { content: 'js BEM.decl( js' } },
                    output = { block: 'i-bem' };

                depsChecker._getExpectedDeps(input.js, input.bemhtml).must.be.eql(output);
            });

            it('must get block \'i-bem\' and elem \'html\' from JS content', function () {
                var input = { js: { content: 'js BEM.HTML js' } },
                    output = { block: 'i-bem', elems: ['html'] };

                depsChecker._getExpectedDeps(input.js, input.bemhtml).must.be.eql(output);
            });

            it('must get block \'i-bem\' and elem \'html\' from BEMHTML content', function () {
                var input = { bemhtml: { content: 'bemhtml' } },
                    output = { block: 'i-bem', elems: ['html'] };

                depsChecker._getExpectedDeps(input.js, input.bemhtml).must.be.eql(output);
            });

            it('must get block \'i-bem\' and elem \'dom\'', function () {
                var input = { js: { content: 'js BEM.DOM.decl( js' } },
                    output = { block: 'i-bem', elems: ['dom'] };

                depsChecker._getExpectedDeps(input.js, input.bemhtml).must.be.eql(output);
            });

            it('must get block \'i-bem\' and elem \'internal\'', function () {
                var input = { js: { content: 'js BEM.INTERNAL js' } },
                    output = { block: 'i-bem', elems: ['internal'] };

                depsChecker._getExpectedDeps(input.js, input.bemhtml).must.be.eql(output);
            });

            it('must get block \'i-bem\' and elem \'i18n\' from JS content', function () {
                var input = { js: { content: 'js BEM.I18N( js' } },
                    output = { block: 'i-bem', elems: ['i18n'] };

                depsChecker._getExpectedDeps(input.js, input.bemhtml).must.be.eql(output);
            });

            it('must get block \'i-bem\' and elem \'i18n\' from BEMHTML content (1st RegExp)', function () {
                var input = { bemhtml: { content: 'bemhtml BEM.I18N( bemhtml' } },
                    output = { block: 'i-bem', elems: ['html', 'i18n'] };

                depsChecker._getExpectedDeps(input.js, input.bemhtml).must.be.eql(output);
            });

            it('must get block \'i-bem\' and elem \'i18n\' from BEMHTML content (2nd RegExp)', function () {
                var input = { bemhtml: { content: 'bemhtml \n    block  :\t \'i-bem\'  ,\n\n elem\t\n:  \'i18n\'' } },
                    output = { block: 'i-bem', elems: ['html', 'i18n'] };

                depsChecker._getExpectedDeps(input.js, input.bemhtml).must.be.eql(output);
            });
        });

        describe('compare deps', function () {
            it('must NOT be equal by \'block\' property', function () {
                var input = { actualDeps: { block: 'i-bem' }, expectedDeps: {} };

                depsChecker._isEqual(input.actualDeps, input.expectedDeps).must.be.false();
            });

            it('must NOT be equal by \'elems\' property', function () {
                var input = {
                    actualDeps: { block: 'i-bem', elems: ['dom', 'html'] },
                    expectedDeps: { block: 'i-bem', elems: ['dom', 'html', 'i18n'] }
                };

                depsChecker._isEqual(input.actualDeps, input.expectedDeps).must.be.false();
            });

            it('must be equal', function () {
                var input = {
                    actualDeps: { block: 'i-bem', elems: ['internal', 'i18n', 'html', 'dom'] },
                    expectedDeps: { block: 'i-bem', elems: ['dom', 'html', 'i18n', 'internal'] }
                };

                depsChecker._isEqual(input.actualDeps, input.expectedDeps).must.be.true();
            });
        });
    });

    describe('checker', function () {
        it('must find deps errors', function () {
            var entities = require('../fixtures/rules/deps-checker/with-errors'),
                output = [
                    {
                        fullpath: 'blocks/block1/block1.deps.js',
                        actualDeps: {},
                        expectedDeps: { block: 'i-bem', elems: ['dom', 'html', 'i18n'] }
                    },
                    {
                        fullpath: 'blocks/block2',
                        actualDeps: 'No deps file block2.deps.js',
                        expectedDeps: { block: 'i-bem' }
                    }
                ];

            depsChecker.check(entities).must.be.eql(output);
        });

        it('must not find deps errors', function () {
            var entities = require('../fixtures/rules/deps-checker/no-errors');

            depsChecker.check(entities).must.be.eql([]);
        });
    });
});
