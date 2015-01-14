var mockFs = require('mock-fs'),
    scan = require('../../lib/walk');

var expectedList = require('./fixtures/expected-entities');

describe('walk', function () {
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
                    'block1.tech': {
                        blocks: {
                            block1: {
                                'block1.css': 'block1.css'
                            }
                        }
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
                    'block1.examples': {
                        blocks: {
                            block1: {
                                'block1.css': 'block1.css'
                            }
                        }
                    },
                    'block1.tests': {
                        blocks: {
                            block1: {
                                'block1.js': 'block1.js'
                            }
                        }
                    },
                    'block1.css': 'block1.css'
                }
            }
        });
    });

    afterEach(function () {
        mockFs.restore();
    });

    it('must load entities', function (done) {
        scan(['common.blocks', 'desktop.blocks'])
            .then(function (res) {
                res.must.be.eql(expectedList);
            })
            .then(done, done);
    });
});
