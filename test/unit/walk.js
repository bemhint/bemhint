var mockFs = require('mock-fs'),
    scan = require('../../lib/walk'),
    Configuration = require('../../lib/configuration');

var entities = {
    fromLevels: require('./fixtures/walk/all-entities'),
    fromTargets: require('./fixtures/walk/specified-entities')
};

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
                        examples: {
                            example1: {
                                'example1.css': 'example1.css'
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
            },
            another: {}
        });
    });

    afterEach(function () {
        mockFs.restore();
    });

    it('must load all entities', function (done) {
        var config = new Configuration({
            levels: ['*blocks', '*examples'],
            excludeFiles: []
        });

        scan(['.'], config)
            .then(function (res) {
                res.must.be.eql(entities.fromLevels);
            })
            .then(done, done);
    });

    it('must load specified entities', function (done) {
        var config = new Configuration({
            levels: ['*blocks', '*examples'],
            excludeFiles: []
        });

        scan(['common.blocks/block2', 'desktop.blocks/block1/block1.examples/examples', 'another'], config)
            .then(function (res) {
                res.must.be.eql(entities.fromTargets);
            })
            .then(done, done);
    });

    it('must exclude all files', function (done) {
        var config = new Configuration({
            levels: ['*blocks'],
            excludeFiles: ['*blocks/**']
        });

        scan(['common.blocks', 'desktop.blocks'], config)
            .then(function (res) {
                res.must.be.eql({});
            })
            .then(done, done);
    });
});
