'use strict';

var mockFs = require('mock-fs'),
    resolve = require('resolve'),
    sinon = require('sinon'),
    Config = require('../lib/config'),
    Plugin = require('../lib/plugin');

describe('folded-levels', () => {
    let config;

    describe('.getLevels', () => {
        beforeEach(() => {
            mockFs({
                '/some-lib': {
                    'blocks': {
                        'some-level': {
                            'block': {
                                'block.ext': 'foo'
                            }
                        },
                    }
                }
            });
        });

        afterEach(() => {
            mockFs.restore();
        });

        describe('file target', () => {
            it('should get last level in target', () => {
                config = new Config(['/some-lib/blocks/some-level/block/block.ext'], {
                    levels: ['some-level'],
                    foldedLevels: true,
                });

                return config.getLevels().should.become(['/some-lib/blocks/some-level']);
            });

        });

        describe('dir target', () => {
            it('should get last level in target', () => {
                config = new Config(['/some-lib/blocks/some-level'], {
                    levels: ['some-level']
                });

                return config.getLevels().should.become(['/some-lib/blocks/some-level']);
            });

        });
    });

    describe('.isTargetPath', () => {
        beforeEach(() => {
            mockFs({'/blocks/block/block.ext': 'foo'});
        });

        afterEach(() => {
            mockFs.restore();
        });

        it('should be a target path for dir input target', () => {
            config = new Config(['/blocks/block']);

            config.isTargetPath('/blocks/block/block.ext').should.be.true;
        });

        it('should not be a target path for dir input target', () => {
            config = new Config(['/blocks/block']);

            config.isTargetPath('/blocks/other/block.ext').should.be.false;
        });

        it('should be a target path for file input target', () => {
            config = new Config(['/blocks/block/block.ext']);

            config.isTargetPath('/blocks/block/block.another.ext').should.be.true;
        });

        it('should not be a target path for file input target', () => {
            config = new Config(['/blocks/block/block.ext']);

            config.isTargetPath('/some.blocks/other/block.ext').should.be.false;
        });
    });

});
