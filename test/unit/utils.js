var depsUtils = require('../../lib/checker/utils'),
    bemhintUtils = require('../../lib/utils');

describe('utils', function () {
    describe('deps-checker', function () {
        it('must get actual deps', function () {
            var input = [
                { mustDeps: 'i-bem' }, // 0
                { mustDeps: { block: 'i-bem' } }, // 1
                { mustDeps: { block: 'i-bem', elem: 'dom' } }, // 2
                { mustDeps: { block: 'i-bem', elem: { name: 'dom' } } }, // 3
                { mustDeps: { block: 'i-bem', elem: { val: 'blah' } } }, // 4
                { mustDeps: { block: 'i-bem', elem: ['dom', 'html'] } }, // 5
                { mustDeps: { block: 'i-bem', elems: 'dom' } }, // 6
                { mustDeps: { block: 'i-bem', elems: [{ name: 'dom' }, { name: 'html' }] } }, // 7
                { mustDeps: { block: 'i-bem', elems: [{ val: 'blah' }, ['blah']] } }, // 8
                [
                    { tech: 'js', mustDeps: [] },
                    { mustDeps: [{ block: 'blah' }, { block: 'i-bem', elems: ['dom'] }] } // 9
                ]
            ],
            output = [
                { block: 'i-bem' }, // 0
                { block: 'i-bem' }, // 1
                { block: 'i-bem', elems: ['dom'] }, // 2
                { block: 'i-bem', elems: ['dom'] }, // 3
                { block: 'i-bem' }, // 4
                { block: 'i-bem' }, // 5
                { block: 'i-bem', elems: ['dom'] }, // 6
                { block: 'i-bem', elems: ['dom', 'html'] }, // 7
                { block: 'i-bem' }, // 8
                { block: 'i-bem', elems: ['dom'] } // 9
            ];

            for (var i = 0; i < input.length; i++) {
                depsUtils.getActualDeps(input[i]).must.be.eql(output[i]);
            }
        });

        it('must get expected deps', function () {
            var input = [
                { jsContent: '', bemhtmlContent: '' }, // 0
                { jsContent: 'js BEM.decl( js', bemhtmlContent: '' }, // 1
                { jsContent: '', bemhtmlContent: 'bemhtml' }, // 2
                { jsContent: 'js BEM.DOM.decl( js', bemhtmlContent: '' }, // 3
                { jsContent: 'js BEM.INTERNAL js', bemhtmlContent: '' }, // 4
                { jsContent: 'js BEM.HTML js', bemhtmlContent: '' }, // 5
                { jsContent: 'js BEM.I18N( js', bemhtmlContent: '' }, // 6
                { jsContent: '', bemhtmlContent: 'bemhtml BEM.I18N( bemhtml' }, // 7
                { jsContent: '', bemhtmlContent: 'bemhtml \n    block  :\t \'i-bem\'  ,\n\n elem\t\n:  \'i18n\'' } // 8
            ],
            output = [
                {}, // 0
                { block: 'i-bem' }, // 1
                { block: 'i-bem', elems: ['html'] }, // 2
                { block: 'i-bem', elems: ['dom'] }, // 3
                { block: 'i-bem', elems: ['internal'] }, // 4
                { block: 'i-bem', elems: ['html'] }, // 5
                { block: 'i-bem', elems: ['i18n'] }, // 6
                { block: 'i-bem', elems: ['html', 'i18n'] }, // 7
                { block: 'i-bem', elems: ['html', 'i18n'] } // 8
            ];

            for (var i = 0; i < input.length; i++) {
                depsUtils.getExpectedDeps(input[i].jsContent, input[i].bemhtmlContent).must.be.eql(output[i]);
            }
        });

        it('must compare deps correctly', function () {
            var input = [
                {
                    actualDeps: { block: 'i-bem' },
                    expectedDeps: {}
                },
                {
                    actualDeps: { block: 'i-bem', elems: ['dom', 'html'] },
                    expectedDeps: { block: 'i-bem', elems: ['dom', 'html', 'i18n'] }
                },
                {
                    actualDeps: { block: 'i-bem', elems: ['internal', 'i18n', 'html', 'dom'] },
                    expectedDeps: { block: 'i-bem', elems: ['dom', 'html', 'i18n', 'internal'] }
                }
            ],
            output = [false, false, true];

            for (var i = 0; i < input.length; i++) {
                depsUtils.isEqual(input[i].actualDeps, input[i].expectedDeps).must.be.equal(output[i]);
            }
        });

        it('must sort array of objects by property \'fullpath\'', function () {
            var input = [{ fullpath: '3' }, { fullpath: '2' }, { fullpath: '1' }],
                output = [{ fullpath: '1' }, { fullpath: '2' }, { fullpath: '3' }];

            depsUtils.sortByFullpath(input).must.be.eql(output);
        });
    });

    describe('bemhint', function () {
        it('must filter entities by techs', function () {
            var input = {
                block1: [
                    {
                        name: 'block1.deps.js',
                        tech: 'deps.js',
                        path: 'blocks/block1/block1.deps.js',
                        content: 'block1.deps.js'
                    },
                    {
                        name: 'block1.css',
                        tech: 'css',
                        path: 'blocks/block1/block1.css',
                        content: 'block1.css'
                    },
                    {
                        name: 'block1.js',
                        tech: 'js',
                        path: 'blocks/block1/block1.js',
                        content: 'block1.js'
                    }
                ],
                // jscs: disable
                block1_mod1: [
                    {
                        name: 'block1_mod1.css',
                        tech: 'css',
                        path: 'blocks/block1/_mod1/block1_mod1.css',
                        content: 'block1_mod1.css'
                    }
                ]
            },
            output = {
                block1: [
                    {
                        name: 'block1.deps.js',
                        tech: 'deps.js',
                        path: 'blocks/block1/block1.deps.js',
                        content: 'block1.deps.js'
                    },
                    {
                        name: 'block1.js',
                        tech: 'js',
                        path: 'blocks/block1/block1.js',
                        content: 'block1.js'
                    }
                ]
            };

            bemhintUtils.filterByTechs(input, ['deps.js', 'js']).must.be.eql(output);
        });
    });
});
