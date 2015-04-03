var DepsChecker = require('../../lib/rules/deps-checker'),
    depsChecker = new DepsChecker();

describe('deps-checker', function () {
    describe('private API', function () {
        describe('get actual deps', function () {
            it('must handle a case when deps are \'undefined\'', function () {
                depsChecker._getActualDeps(undefined).must.be.eql({});
            });

            it('must handle a case when there are no pure \'mustDeps\'', function () {
                depsChecker._getActualDeps({ content: '({ tech: "tech", mustDeps: "block" })' }).must.be.eql({});
            });

            it('must handle a case when there are several parts of pure \'mustDeps\'', function () {
                // jscs:disable
                var input = '([{ mustDeps: "i-bem" }, { mustDeps: {} }, { mustDeps: [{ block: "i-bem", elem: "dom" }] }])';

                depsChecker._getActualDeps({ content: input }).must.be.eql('i-bem');
            });

            it('must get block \'i-bem\' from mustDeps given as String', function () {
                depsChecker._getActualDeps({ content: '({ mustDeps: "i-bem" })' }).must.be.eql('i-bem');
            });

            it('must get block \'i-bem\' from mustDeps given as Object', function () {
                depsChecker._getActualDeps({ content: '({ mustDeps: { block: "i-bem" } })' })
                    .must.be.eql({ block: 'i-bem' });
            });

            it('must get block \'i-bem\' with elems from mustDeps given as Object', function () {
                depsChecker._getActualDeps({ content: '({ mustDeps: { block: "i-bem", elems: ["dom", "html"] } })' })
                    .must.be.eql({ block: 'i-bem', elems: ['dom', 'html'] });
            });

            it('must get block \'i-bem\' from mustDeps given as Object[]', function () {
                var input = { content: '([{ mustDeps: [{ block: "i-bem" }] }])' },
                    output = { block: 'i-bem' };

                depsChecker._getActualDeps(input).must.be.eql(output);
            });

            it('must get block \'i-bem\' with elems from mustDeps given as Object[]', function () {
                var input = { content: '([{ mustDeps: [{ block: "i-bem", elem: "dom" }] }])' },
                    output = { block: 'i-bem', elem: 'dom' };

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
                    output = { block: 'i-bem', elems: [] };

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

            it('must get block \'i-bem\' and elem \'i18n\' from BEMHTML content', function () {
                var input = { bemhtml: { content: 'bemhtml BEM.I18N( bemhtml' } },
                    output = { block: 'i-bem', elems: ['html', 'i18n'] };

                depsChecker._getExpectedDeps(input.js, input.bemhtml).must.be.eql(output);
            });

            // jscs: disable
            it('must get block \'i-bem\' and elem \'i18n\' from BEMHTML content (deprecated declaration of I18N)', function () {
                var input = { bemhtml: { content: 'bemhtml \n    block  :\t \'i-bem\'  ,\n\n elem\t\n:  \'i18n\'' } },
                    output = { block: 'i-bem', elems: ['html', 'i18n'] };

                depsChecker._getExpectedDeps(input.js, input.bemhtml).must.be.eql(output);
            });
        });

        describe('normalize deps', function () {
            it('must normalize block \'i-bem\' given as String', function () {
                depsChecker._normalizeDeps('i-bem').must.be.eql({ block: 'i-bem' });
            });

            it('must normalize block \'i-bem\' given as Object', function () {
                depsChecker._normalizeDeps({ block: 'i-bem' }).must.be.eql({ block: 'i-bem', elems: [] });
            });

            it('must normalize block \'i-bem\' and elem given as String', function () {
                var input = { block: 'i-bem', elem: 'dom' },
                    output = { block: 'i-bem', elems: ['dom'] };

                depsChecker._normalizeDeps(input).must.be.eql(output);
            });

            it('must normalize block \'i-bem\' and elem given as Object', function () {
                var input = { block: 'i-bem', elem: { name: 'dom' } },
                    output = { block: 'i-bem', elems: ['dom'] };

                depsChecker._normalizeDeps(input).must.be.eql(output);
            });

            it('must normalize block \'i-bem\' and NOT get elem given as Object', function () {
                var input = { block: 'i-bem', elem: { val: 'blah' } },
                    output = { block: 'i-bem', elems: [] };

                depsChecker._normalizeDeps(input).must.be.eql(output);
            });

            it('must normalize block \'i-bem\' and NOT get elem given as Object[]', function () {
                var input = { block: 'i-bem', elem: ['dom', 'html'] },
                    output = { block: 'i-bem', elems: [] };

                depsChecker._normalizeDeps(input).must.be.eql(output);
            });

            it('must normalize block \'i-bem\' and get elems given as Object[]', function () {
                var input = { block: 'i-bem', elems: ['dom', 'html'] },
                    output = { block: 'i-bem', elems: ['dom', 'html'] };

                depsChecker._normalizeDeps(input).must.be.eql(output);
            });

            it('must normalize block \'i-bem\' and get elems given as String', function () {
                var input = { block: 'i-bem', elems: 'dom' },
                    output = { block: 'i-bem', elems: ['dom'] };

                depsChecker._normalizeDeps(input).must.be.eql(output);
            });

            it('must normalize block \'i-bem\' and get elems given as Object[]', function () {
                var input = { block: 'i-bem', elems: [{ name: 'dom' }, { name: 'html' }] },
                    output = { block: 'i-bem', elems: ['dom', 'html'] };

                depsChecker._normalizeDeps(input).must.be.eql(output);
            });

            it('must normalize block \'i-bem\' and NOT get elems given as Object[]', function () {
                var input = { block: 'i-bem', elems: [{ val: 'blah' }, ['blah']] },
                    output = { block: 'i-bem', elems: [] };

                depsChecker._normalizeDeps(input).must.be.eql(output);
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

    describe('public API', function () {
        it('must find deps errors when there is no file \'*.deps.js\'', function () {
            var entity = {
                    js: {
                        name: 'block1.js',
                        tech: 'js',
                        path: 'blocks/block1/block1.js',
                        content: 'BEM.decl()'
                    }
                },
                output = {
                    path: 'blocks/block1',
                    actual: 'No deps file block1.deps.js',
                    expected: { block: 'i-bem' }
                };

            depsChecker.checkEntity(entity).must.be.eql(output);
        });

        it('must find deps errors when there are no expected deps', function () {
            var entity = {
                    js: {
                        name: 'block1.js',
                        tech: 'js',
                        path: 'blocks/block1/block1.js',
                        content: 'BEM.decl()'
                    },
                    'deps.js': {
                        name: 'block1.js',
                        tech: 'deps.js',
                        path: 'blocks/block1/block1.deps.js',
                        content: '({ mustDeps: [] })'
                    }
                },
                output = {
                    path: 'blocks/block1/block1.deps.js',
                    actual: {},
                    expected: { block: 'i-bem' }
                };

            depsChecker.checkEntity(entity).must.be.eql(output);
        });

        it('must NOT find deps errors', function () {
            var entity = {
                    js: {
                        name: 'block1.js',
                        tech: 'js',
                        path: 'blocks/block1/block1.js',
                        content: 'BEM.decl()'
                    },
                    'deps.js': {
                        name: 'block1.js',
                        tech: 'deps.js',
                        path: 'blocks/block1/block1.deps.js',
                        content: '({ mustDeps: \'i-bem\' })'
                    }
                };

            depsChecker.checkEntity(entity).must.be(false);
        });
    });
});
