var mockFs = require('mock-fs'),
    FileList = require('../../lib/file-list'),
    fileList = new FileList(['common.blocks', 'desktop.blocks']);

var expectedList = require('./fixtures/expected-list'),
    expectedSuffixes = require('./fixtures/expected-suffixes');

describe('file-list', function () {
    beforeEach(function () {
        mockFs({
            'common.blocks': {
                block1: {
                    __elem1:     {
                        _mod1: {
                            'block1__elem1_mod1.css': 'block1__elem1_mod1.css'
                        },
                        'block1__elem1.bemhtml': 'block1__elem1.bemhtml',
                        'block1__elem1.deps.js': 'block1__elem1.deps.js'
                    },
                    _mod1: {
                        'block1_mod1.css': 'block1_mod1.css'
                    },
                    'block1.js': 'block1.js'
                },
                block2: {
                    'block2.js': 'block2.js',
                    'block2.deps.js': 'block2.deps.js'
                }
            },
            'desktop.blocks': {
                block1: {
                    __elem1: {
                        'block1__elem1_mod1.bemhtml': 'block1__elem1_mod1.bemhtml',
                        'block1__elem1_mod1.css': 'block1__elem1_mod1.css',
                        'block1__elem1_mod1.deps.js': 'block1__elem1_mod1.deps.js',
                        'block1__elem1_mod1.js': 'block1__elem1_mod1.js',
                        'block1__elem1_mod2.deps.js': 'block1__elem1_mod2.deps.js',
                        'block1__elem1_mod2.js': 'block1__elem1_mod2.js',
                    },
                    'block1.css': 'block1.css'
                }
            }
        });
    });

    afterEach(function () {
        mockFs.restore();
    });

    it('must load a file list', function (done) {
        fileList.load()
            .then(function () {
                fileList.getContent().must.eql(expectedList);
            })
            .then(done, done);
    });

    it('must get files by suffixes', function (done) {
        fileList.load()
            .then(function () {
                fileList.getFilesBySuffixes(['.bemhtml', '.deps.js', '.js']).must.eql(expectedSuffixes);
            })
            .then(done, done);
    });
});
