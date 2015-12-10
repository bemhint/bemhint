var fs = require('fs'),
    _ = require('lodash'),
    q = require('q'),
    qfs = require('q-io/fs'),
    sinon = require('sinon'),
    Config = require('../lib/config'),
    utils = require('../lib/utils');

describe('Config.prototype', function() {
    var sandbox = sinon.sandbox.create(),
        config;

    beforeEach(function() {
        sandbox.stub(fs, 'statSync');
        sandbox.stub(qfs);

        qfs.listDirectoryTree.returns(q([]));

        config = new Config();
    });

    afterEach(function() {
        sandbox.restore();
    });

    ///
    function setTargetType_(type) {
        fs.statSync.returns({isFile: _.constant(type === 'file')});
    }

    describe('.getLevels', function() {
        it('should get the last level in a target dir path', function() {
            setTargetType_('dir');

            config = new Config(['/some-lib/some.blocks/some-block/some-block.examples/blocks'], {
                config: {levels: ['*blocks']}
            });

            return config.getLevels()
                .should.become(['/some-lib/some.blocks/some-block/some-block.examples/blocks']);
        });

        it('should get the uniq last level in targets dir paths', function() {
            setTargetType_('dir');

            config = new Config(['/some-lib/some.blocks', '/some-lib/some.blocks'], {
                config: {levels: ['*blocks']}
            });

            return config.getLevels()
                .should.become(['/some-lib/some.blocks']);
        });

        it('should get the last level in a target dir path with `/` at the end', function() {
            setTargetType_('dir');

            config = new Config(['/some-lib/some.blocks/some-block/some-block.examples/blocks/'], {
                config: {levels: ['*blocks']}
            });

            return config.getLevels()
                .should.become(['/some-lib/some.blocks/some-block/some-block.examples/blocks']);
        });

        it('should not find levels in a target dir path', function() {
            setTargetType_('dir');

            config = new Config(['/some-path/some-dir'], {config: {levels: ['*blocks']}});

            return config.getLevels().should.become([]);
        });

        it('should not get the last level in a target dir path if it is excluded', function() {
            setTargetType_('dir');

            config = new Config(['/libs/some-lib/some.blocks'], {
                config: {levels: ['*blocks'], excludePaths: ['/libs/**']}
            });

            return config.getLevels().should.become([]);
        });

        it('should get a level in a target dir tree', function() {
            setTargetType_('dir');

            config = new Config(['/some-lib'], {config: {levels: ['*blocks']}});

            qfs.listDirectoryTree.returns(q(['/some-lib/some.blocks']));

            return config.getLevels().should.become(['/some-lib/some.blocks']);
        });

        it('should get the uniq level in targets dir trees', function() {
            setTargetType_('dir');

            config = new Config(['/some-lib', '/some-lib'], {config: {levels: ['*blocks']}});

            qfs.listDirectoryTree.returns(q(['/some-lib/some.blocks']));

            return config.getLevels().should.become(['/some-lib/some.blocks']);
        });

        it('should not find levels in a target dir tree', function() {
            setTargetType_('dir');

            config = new Config(['/some-lib'], {config: {levels: ['*blocks']}});

            qfs.listDirectoryTree.returns(q(['/some-lib/some-dir']));

            return config.getLevels().should.become([]);
        });

        it('should not get a level in a target dir tree if it is excluded', function() {
            setTargetType_('dir');

            config = new Config(['/libs'], {
                config: {levels: ['*blocks'], excludePaths: ['/libs/**']}
            });

            qfs.listDirectoryTree.returns(q(['/libs/some-lib/some.blocks']));

            return config.getLevels().should.become([]);
        });

        it('should get the last level in a target file path', function() {
            setTargetType_('file');

            config = new Config(['/some-lib/some.blocks/some-block/some-block.examples/blocks/block/block.ext'], {
                config: {levels: ['*blocks']}
            });

            return config.getLevels()
                .should.become(['/some-lib/some.blocks/some-block/some-block.examples/blocks']);
        });

        it('should get the uniq last level in targets file paths', function() {
            setTargetType_('file');

            config = new Config([
                '/some.blocks/some-block/some-block.ext',
                '/some.blocks/some-block/some-block.ext'
            ], {config: {levels: ['*blocks']}});

            return config.getLevels().should.become(['/some.blocks']);
        });

        it('should not find levels in a target file path', function() {
            setTargetType_('file');

            config = new Config(['/some-path/some-dir/some-file.ext'], {config: {levels: ['*blocks']}});

            return config.getLevels().should.become([]);
        });

        it('should not get the last level in a target file path if it is excluded', function() {
            setTargetType_('file');

            config = new Config(['/libs/some-lib/some.blocks/some-block/some-block.ext'], {
                config: {levels: ['*blocks'], excludePaths: ['/libs/**']}
            });

            return config.getLevels().should.become([]);
        });

        it('should not try to find levels in a target tree if it is a file', function() {
            setTargetType_('file');

            config = new Config(['/libs/some-lib/some.blocks/some-block/some-block.ext']);
        });
    });

    describe('.isTargetPath', function() {
        it('should be a target path when an input target is a dir', function() {
            setTargetType_('dir');

            config = new Config(['/some.blocks/some.blocks']);

            config.isTargetPath('/some.blocks/some.blocks/some-block/some-block.ext').should.be.true;
        });

        it('should not be a target path when an input target is a dir', function() {
            setTargetType_('dir');

            config = new Config(['/some.blocks/some.blocks']);

            config.isTargetPath('/some.blocks/another.blocks/some-block/some-block.ext').should.be.false;
        });

        it('should be a target path when an input target is a file', function() {
            setTargetType_('file');

            config = new Config(['/some.blocks/some-block/some-block.some.ext']);

            config.isTargetPath('/some.blocks/some-block/some-block.another.ext').should.be.true;
        });

        it('should not be a target path when an input target is a file', function() {
            setTargetType_('file');

            config = new Config(['/some-block/some-block/some-block.some.ext']);

            config.isTargetPath('/some.blocks/another-block/another-block.ext').should.be.false;
        });
    });

    describe('.isExcludedPath', function() {
        it('should be an excluded dir path', function() {
            config = new Config([], {config: {excludePaths: ['/some-lib/**']}});

            config.isExcludedPath('/some-lib/some.blocks').should.be.true;
        });

        it('should not be an excluded dir path', function() {
            config = new Config([], {config: {excludePaths: ['/some-lib/**']}});

            config.isExcludedPath('/another-lib/some.blocks').should.be.false;
        });

        it('should be an excluded file path', function() {
            config = new Config([], {config: {excludePaths: ['/some.blocks/some-block/some-block.*']}});

            config.isExcludedPath('/some.blocks/some-block/some-block.ext').should.be.true;
        });

        it('should not be an excluded file path', function() {
            config = new Config([], {config: {excludePaths: ['/some.blocks/some-block/some-block.*']}});

            config.isExcludedPath('/some.blocks/some-block/another-block.ext').should.be.false;
        });

        it('should resolve an excluded path according to a config path', function() {
            config = new Config([], {config: {excludePaths: ['libs/**']}, configPath: '/config/path/.bemhint'});

            config.isExcludedPath('/config/path/libs/some-lib').should.be.true;
        });
    });

    describe('.requirePlugins', function() {
        beforeEach(function() {
            sandbox.stub(utils, 'requirePlugin');
        });

        it('should require local plugins', function() {
            config = new Config([], {
                configPath: '/config/path/.bemhint',
                config: {plugins: ['./some/plugin']}
            });

            config.requirePlugins();

            utils.requirePlugin.should.be.calledWith('/config/path/some/plugin');
        });

        it('should require plugins from `node_modules`', function() {
            config = new Config([], {config: {plugins: ['some/plugin']}});

            config.requirePlugins();

            utils.requirePlugin.should.be.calledWith('some/plugin');
        });
    });
});
