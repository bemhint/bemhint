var mockFs = require('mock-fs'),
    minimatch = require('minimatch'),
    scan = require('../../lib/walk');

var entities = {
    fromLevels: require('./fixtures/walk/entities-from-levels'),
    fromTargets: require('./fixtures/walk/entities-from-targets')
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
            },
            another: {}
        });
    });

    afterEach(function () {
        mockFs.restore();
    });

    it('must load entities from levels', function (done) {
        scan(undefined, [])
            .then(function (res) {
                res.must.be.eql(entities.fromLevels);
            })
            .then(done, done);
    });

    it('must load entities from targets', function (done) {
        scan(['common.blocks/block2', 'desktop.blocks/block1/block1.examples/', 'another'], [])
            .then(function (res) {
                res.must.be.eql(entities.fromTargets);
            })
            .then(done, done);
    });

    it('must exclude all files', function (done) {
        var revealedMask = new minimatch.Minimatch('*blocks/**', {
                dot: true
            });

        scan(['common.blocks', 'desktop.blocks'], [revealedMask])
            .then(function (res) {
                res.must.be.eql({});
            })
            .then(done, done);
    });
});
