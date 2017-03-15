'use strict';

var mockFs = require('mock-fs'),
    resolve = require('resolve'),
    sinon = require('sinon'),
    Config = require('../lib/config'),
    Plugin = require('../lib/plugin');

describe('Config.prototype', () => {
    let config;

    describe('.getLevels', () => {
        beforeEach(() => {
            mockFs({
                '/some-lib': {
                    'some.blocks': {
                        'blocks': {
                            'block.ext': 'foo'
                        }
                    },
                    'some.other': {
                        'other.ext': 'bar'
                    }
                }
            });
        });

        afterEach(() => {
            mockFs.restore();
        });

        describe('file target', () => {
            it('should get last level in target', () => {
                config = new Config(['/some-lib/some.blocks/blocks/block.ext'], {
                    levels: ['*blocks']
                });

                return config.getLevels().should.become(['/some-lib/some.blocks/blocks']);
            });

            it('should get the uniq last level in target', () => {
                config = new Config(
                    [
                        '/some-lib/some.blocks/blocks/block.ext',
                        '/some-lib/some.blocks/blocks/block.ext'
                    ],
                    {levels: ['*blocks']}
                );

                return config.getLevels().should.become(['/some-lib/some.blocks/blocks']);
            });

            it('should not get level if none exists', () => {
                config = new Config(['/some-lib/some.other/other.ext'], {
                    levels: ['*blocks']
                });

                return config.getLevels().should.become([]);
            });

            it('should not get level if it is excluded', () => {
                config = new Config(['/some-lib/some.blocks/blocks/block.ext'], {
                    levels: ['*blocks'], excludePaths: ['/some-lib/**']
                });

                return config.getLevels().should.become([]);
            });
        });

        describe('dir target', () => {
            it('should get last level in target', () => {
                config = new Config(['/some-lib/some.blocks/blocks'], {
                    levels: ['*blocks']
                });

                return config.getLevels().should.become(['/some-lib/some.blocks/blocks']);
            });

            it('should get last level in target with `/` at the end', () => {
                config = new Config(['/some-lib/some.blocks/blocks/'], {
                    levels: ['*blocks']
                });

                return config.getLevels().should.become(['/some-lib/some.blocks/blocks']);
            });

            it('should get the uniq last level in target', () => {
                config = new Config(['/some-lib/some.blocks/blocks', '/some-lib/some.blocks/blocks'], {
                    levels: ['*blocks']
                });

                return config.getLevels().should.become(['/some-lib/some.blocks/blocks']);
            });

            it('should get levels from target and dir trees', () => {
                config = new Config(['/some-lib/some.blocks'], {
                    levels: ['*blocks']
                });

                return config.getLevels().should.become(['/some-lib/some.blocks', '/some-lib/some.blocks/blocks']);
            });

            it('should not get level if none exists', () => {
                config = new Config(['/some-lib/some.other'], {
                    levels: ['*blocks']
                });

                return config.getLevels().should.become([]);
            });

            it('should not get level if it is excluded', () => {
                config = new Config(['/some-lib/some.blocks'], {
                    levels: ['*blocks'], excludePaths: ['/some-lib/**']
                });

                return config.getLevels().should.become([]);
            });

            it('should filter level from dir tree if it is excluded', () => {
                config = new Config(['/some-lib/some.blocks'], {
                    levels: ['*blocks'], excludePaths: ['/some-lib/some.blocks/**']
                });

                return config.getLevels().should.become(['/some-lib/some.blocks']);
            });

            it('should not get level for matched file', () => {
                config = new Config(['/some-lib/some.blocks'], {
                    levels: ['block*']
                });

                return config.getLevels().should.become(['/some-lib/some.blocks/blocks']);
            });
        });
    });

    describe('.isTargetPath', () => {
        beforeEach(() => {
            mockFs({'/some.blocks/blocks/block.ext': 'foo'});
        });

        afterEach(() => {
            mockFs.restore();
        });

        it('should be a target path for dir input target', () => {
            config = new Config(['/some.blocks/blocks']);

            config.isTargetPath('/some.blocks/blocks/block.ext').should.be.true;
        });

        it('should not be a target path for dir input target', () => {
            config = new Config(['/some.blocks/blocks']);

            config.isTargetPath('/some.blocks/other/block.ext').should.be.false;
        });

        it('should be a target path for file input target', () => {
            config = new Config(['/some.blocks/blocks/block.ext']);

            config.isTargetPath('/some.blocks/blocks/block.another.ext').should.be.true;
        });

        it('should not be a target path for file input target', () => {
            config = new Config(['/some.blocks/blocks/block.ext']);

            config.isTargetPath('/some.blocks/other/block.ext').should.be.false;
        });
    });

    describe('.isExcludedPath', () => {
        it('should be an excluded dir path', () => {
            config = new Config([], {excludePaths: ['/some-lib/**']});

            config.isExcludedPath('/some-lib/some.blocks').should.be.true;
        });

        it('should not be an excluded dir path', () => {
            config = new Config([], {excludePaths: ['/some-lib/**']});

            config.isExcludedPath('/another-lib/some.blocks').should.be.false;
        });

        it('should be an excluded file path', () => {
            config = new Config([], {excludePaths: ['/some.blocks/some-block/some-block.*']});

            config.isExcludedPath('/some.blocks/some-block/some-block.ext').should.be.true;
        });

        it('should not be an excluded file path', () => {
            config = new Config([], {excludePaths: ['/some.blocks/some-block/some-block.*']});

            config.isExcludedPath('/some.blocks/some-block/another-block.ext').should.be.false;
        });

        it('should resolve an excluded path according to a base dir', () => {
            config = new Config([], {excludePaths: ['libs/**'], basedir: '/base/dir'});

            config.isExcludedPath('/base/dir/libs/some-lib').should.be.true;
        });
    });

    describe('.requirePlugins', () => {
        const sandbox = sinon.sandbox.create();

        beforeEach(() => {
            sandbox.stub(Plugin.prototype);
            sandbox.stub(resolve, 'sync');
        });

        afterEach(() => {
            sandbox.restore();
        });

        it('should not require plugins with falsey config', () => {
            config = new Config([], {plugins: {'some-plugin': false}});

            Plugin.prototype.__constructor.should.not.be.called;
            config.requirePlugins().should.be.eql([]);
        });

        it('should require plugins with truthy config', () => {
            config = new Config([], {plugins: {'some-plugin': true}});

            var plugins = config.requirePlugins();

            Plugin.prototype.__constructor.should.be.called;

            plugins.should.have.length(1);
            plugins[0].should.be.instanceOf(Plugin);
        });

        it('should require plugins relatively to base dir', () => {
            config = new Config([], {plugins: {'some-plugin': true}, basedir: '/base/dir'});

            resolve.sync.returns('/base/dir/node_modules/some-plugin');

            config.requirePlugins();

            resolve.sync.should.be.calledWith('some-plugin', {basedir: '/base/dir'});
            Plugin.prototype.__constructor.should.be.calledWith('/base/dir/node_modules/some-plugin', {
                userConfig: true,
                baseConfig: {configDir: '/base/dir'}
            });
        });
    });
});
