var mockFs = require('mock-fs'),
    bemhint = require('../../lib/bemhint');

describe('bemhint', function () {
    afterEach(function () {
        mockFs.restore();
    });

    it('must not find BEM erros', function (done) {
        mockFs({
            blocks: {
                block1: {
                    __elem: {
                        'block1__elem_mod1.bemhtml': 'BEM.I18N()',
                        // jscs:disable
                        'block1__elem_mod1.deps.js': '([{ mustDeps: [{ block: \'i-bem\', elems: [\'dom\', \'html\', \'i18n\'] }] }])',
                        'block1__elem_mod1.js': 'BEM.DOM.decl()',
                        'block1__elem_mod2.deps.js': '([{ mustDeps: [{ block: \'i-bem\' }] }])',
                        'block1__elem_mod2.js': 'BEM.decl()'
                    },
                    _mod: {
                        'block1_mod.bemhtml': '{ block: \'i-bem\', elem: \'i18n\' }',
                        'block1_mod.deps.js': '([{ mustDeps: [{ block: \'i-bem\', elems: [\'html\', \'i18n\'] }] }])'
                    },
                    'block1.css': 'css',
                    // jscs: disable
                    'block1.deps.js': '([{ mustDeps: [{ block: \'i-bem\', elems: [\'html\', \'internal\', \'i18n\'] }] }])',
                    'block1.js': 'BEM.HTML;BEM.INTERNAL;BEM.I18N();'
                }
            }
        });

        bemhint({ checkDirectories: ['blocks'] })
            .then(function (res) {
                res.must.be.eql([]);
            })
            .then(done, done);
    });

    it('must find BEM erros', function (done) {
        mockFs({
            blocks: {
                block1: {
                    __elem: {
                        'block1__elem_mod1.bemhtml': 'BEM.I18N()',
                        'block1__elem_mod1.js': 'BEM.DOM.decl()',
                        'block1__elem_mod2.deps.js': '([{ mustDeps: [] }])',
                        'block1__elem_mod2.js': 'BEM.decl()'
                    },
                    _mod: {
                        'block1_mod.bemhtml': '{ block: \'i-bem\', elem: \'i18n\' }',
                        'block1_mod.deps.js': '([{ mustDeps: [{ block: \'i-bem\', elems: [\'html\'] }] }])'
                    },
                    'block1.css': 'css',
                    'block1.deps.js': '([{ mustDeps: [{ block: \'i-bem\' }] }])',
                    'block1.js': 'BEM.HTML;BEM.INTERNAL;BEM.I18N();'
                }
            }
        });

        var output = [
            {
                fullpath: 'blocks/block1/__elem',
                actualDeps: 'No deps file block1__elem_mod1.deps.js',
                expectedDeps: { block: 'i-bem', elems: [ 'dom', 'html', 'i18n' ] }
            },
            {
                fullpath: 'blocks/block1/__elem/block1__elem_mod2.deps.js',
                actualDeps: {},
                expectedDeps: { block: 'i-bem' } },
            {
                fullpath: 'blocks/block1/_mod/block1_mod.deps.js',
                actualDeps: { block: 'i-bem', elems: [ 'html' ] },
                expectedDeps: { block: 'i-bem', elems: [ 'html', 'i18n' ] }
            },
            {
                fullpath: 'blocks/block1/block1.deps.js',
                actualDeps: { block: 'i-bem' },
                expectedDeps: { block: 'i-bem', elems: [ 'html', 'internal', 'i18n' ] }
            }
        ];

        bemhint({ checkDirectories: ['blocks'] })
            .then(function (res) {
                res.must.be.eql(output);
            })
            .then(done, done);
    });
});
