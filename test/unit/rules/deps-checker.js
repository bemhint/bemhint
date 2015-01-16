var DepsChecker = require('../../../lib/rules/deps-checker'),
    depsChecker = new DepsChecker();

describe('deps-checker', function () {
    describe('utils', function () {
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
                depsChecker._getActualDeps(input[i]).must.be.eql(output[i]);
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
                depsChecker._getExpectedDeps(input[i].jsContent, input[i].bemhtmlContent).must.be.eql(output[i]);
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
                depsChecker._isEqual(input[i].actualDeps, input[i].expectedDeps).must.be.equal(output[i]);
            }
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
