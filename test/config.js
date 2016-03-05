// TODO: rewrite tests using `mock-fs`

var fs = require('fs'),
    _ = require('lodash'),
    q = require('q'),
    qfs = require('q-io/fs'),
    resolve = require('resolve'),
    sinon = require('sinon'),
    Config = require('../lib/config'),
    Plugin = require('../lib/plugin');

describe('Config.prototype', function() {
    var sandbox = sinon.sandbox.create(),
        config;

    beforeEach(function() {
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
        beforeEach(function() {
            sandbox.stub(fs, 'statSync');

            sandbox.stub(qfs);

            qfs.listTree.returns(q([]));
        });

        it('should get the last level in a target dir path', function() {
            setTargetType_('dir');

            config = new Config(['/some-lib/some.blocks/some-block/some-block.examples/blocks'], {
                levels: ['*blocks']
            });

            return config.getLevels().should.become(['/some-lib/some.blocks/some-block/some-block.examples/blocks']);
        });

        it('should get the uniq last level in targets dir paths', function() {
            setTargetType_('dir');

            config = new Config(['/some-lib/some.blocks', '/some-lib/some.blocks'], {levels: ['*blocks']});

            return config.getLevels().should.become(['/some-lib/some.blocks']);
        });

        it('should get the last level in a target dir path with `/` at the end', function() {
            setTargetType_('dir');

            config = new Config(['/some-lib/some.blocks/some-block/some-block.examples/blocks/'], {
                levels: ['*blocks']
            });

            return config.getLevels().should.become(['/some-lib/some.blocks/some-block/some-block.examples/blocks']);
        });

        it('should not find levels in a target dir path', function() {
            setTargetType_('dir');

            config = new Config(['/some-path/some-dir'], {levels: ['*blocks']});

            return config.getLevels().should.become([]);
        });

        it('should not get the last level in a target dir path if it is excluded', function() {
            setTargetType_('dir');

            config = new Config(['/libs/some-lib/some.blocks'], {levels: ['*blocks'], excludePaths: ['/libs/**']});

            return config.getLevels().should.become([]);
        });

        it('should get a level in a target dir tree', function() {
            setTargetType_('dir');

            config = new Config(['/some-lib'], {levels: ['*blocks']});

            qfs.listTree.returns(q(['/some-lib/some.blocks']));

            return config.getLevels().should.become(['/some-lib/some.blocks']);
        });

        it('should get the uniq level in targets dir trees', function() {
            setTargetType_('dir');

            config = new Config(['/some-lib', '/some-lib'], {levels: ['*blocks']});

            qfs.listTree.returns(q(['/some-lib/some.blocks']));

            return config.getLevels().should.become(['/some-lib/some.blocks']);
        });

        it.skip('should not find levels in a target dir tree', function() {
            setTargetType_('dir');

            config = new Config(['/some-lib'], {levels: ['*blocks']});

            qfs.listTree.returns(q(['/some-lib/some-dir']));

            return config.getLevels().should.become([]);
        });

        it.skip('should not get a level in a target dir tree if it is excluded', function() {
            setTargetType_('dir');

            config = new Config(['/libs'], {levels: ['*blocks'], excludePaths: ['/libs/**']});

            qfs.listTree.returns(q(['/libs/some-lib/some.blocks']));

            return config.getLevels().should.become([]);
        });

        it('should get the last level in a target file path', function() {
            setTargetType_('file');

            config = new Config(['/some-lib/some.blocks/some-block/some-block.examples/blocks/block/block.ext'], {
                levels: ['*blocks']
            });

            return config.getLevels().should.become(['/some-lib/some.blocks/some-block/some-block.examples/blocks']);
        });

        it('should get the uniq last level in targets file paths', function() {
            setTargetType_('file');

            config = new Config([
                '/some.blocks/some-block/some-block.ext',
                '/some.blocks/some-block/some-block.ext'
            ], {levels: ['*blocks']});

            return config.getLevels().should.become(['/some.blocks']);
        });

        it('should not find levels in a target file path', function() {
            setTargetType_('file');

            config = new Config(['/some-path/some-dir/some-file.ext'], {levels: ['*blocks']});

            return config.getLevels().should.become([]);
        });

        it('should not get the last level in a target file path if it is excluded', function() {
            setTargetType_('file');

            config = new Config(['/libs/some-lib/some.blocks/some-block/some-block.ext'], {
                levels: ['*blocks'], excludePaths: ['/libs/**']
            });

            return config.getLevels().should.become([]);
        });

        it('should not try to find levels in a target tree if it is a file', function() {
            setTargetType_('file');

            config = new Config(['/libs/some-lib/some.blocks/some-block/some-block.ext']);
        });
    });

    describe('.isTargetPath', function() {
        beforeEach(function() {
            sandbox.stub(fs, 'statSync');
        });

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
            config = new Config([], {excludePaths: ['/some-lib/**']});

            config.isExcludedPath('/some-lib/some.blocks').should.be.true;
        });

        it('should not be an excluded dir path', function() {
            config = new Config([], {excludePaths: ['/some-lib/**']});

            config.isExcludedPath('/another-lib/some.blocks').should.be.false;
        });

        it('should be an excluded file path', function() {
            config = new Config([], {excludePaths: ['/some.blocks/some-block/some-block.*']});

            config.isExcludedPath('/some.blocks/some-block/some-block.ext').should.be.true;
        });

        it('should not be an excluded file path', function() {
            config = new Config([], {excludePaths: ['/some.blocks/some-block/some-block.*']});

            config.isExcludedPath('/some.blocks/some-block/another-block.ext').should.be.false;
        });

        it('should resolve an excluded path according to a base dir', function() {
            config = new Config([], {excludePaths: ['libs/**'], basedir: '/base/dir'});

            config.isExcludedPath('/base/dir/libs/some-lib').should.be.true;
        });
    });

    describe('.requirePlugins', function() {
        beforeEach(function() {
            sandbox.stub(Plugin.prototype);
            sandbox.stub(resolve, 'sync');
        });

        it('should not require plugins with falsey config', function() {
            config = new Config([], {plugins: {'some-plugin': false}});

            Plugin.prototype.__constructor.should.not.be.called;
            config.requirePlugins().should.be.eql([]);
        });

        it('should require plugins with truthy config', function() {
            config = new Config([], {plugins: {'some-plugin': true}});

            var plugins = config.requirePlugins();

            Plugin.prototype.__constructor.should.be.called;

            plugins.should.have.length(1);
            plugins[0].should.be.instanceOf(Plugin);
        });

        it('should require plugins relatively to base dir', function() {
            config = new Config([], {plugins: {'some-plugin': true}, basedir: '/base/dir'});

            resolve.sync.returns('/base/dir/node_modules/some-plugin');

            config.requirePlugins();

            resolve.sync.should.be.calledWith('some-plugin', {basedir: '/base/dir'});
            Plugin.prototype.__constructor.should.be.calledWith('/base/dir/node_modules/some-plugin', true);
        });
    });
});
