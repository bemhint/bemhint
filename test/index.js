var sinon = require('sinon'),
    bemhint = require('../lib'),
    Config = require('../lib/config'),
    flatReporter = require('../lib/reporters/flat'),
    PluginsRunner = require('../lib/plugins-runner'),
    scanner = require('../lib/scanner');

describe('bemhint', function() {
    var sandbox = sinon.sandbox.create();

    beforeEach(function() {
        sandbox.stub(Config.prototype, 'requirePlugins');
        sandbox.stub(flatReporter);
        sandbox.stub(PluginsRunner.prototype);

        Config.prototype.requirePlugins.returns([sinon.spy()]);
    });

    afterEach(function() {
        sandbox.restore();
    });

    describe('core', function() {
        beforeEach(function() {
            sandbox.stub(scanner, 'scan').callsFake(() => Promise.resolve([]));
        });

        it('should init config', function() {
            sandbox.stub(Config.prototype, '__constructor');

            return bemhint(['some-target'], {configPath: '.bemhint'})
                .then(function() {
                    Config.prototype.__constructor.should.be.calledWith(['some-target'], {configPath: '.bemhint'});
                });
        });

        it('should scan levels', function() {
            return bemhint()
                .then(function() {
                    scanner.scan.should.be.calledWith(sinon.match.instanceOf(Config));
                });
        });

        it('should run plugins', function() {
            var plugin = sinon.spy();

            Config.prototype.requirePlugins.returns([plugin]);

            return bemhint()
                .then(function() {
                    PluginsRunner.prototype.runPlugin.should.be.calledWith(plugin);
                });
        });

        it('should get defects', function() {
            return bemhint()
                .then(function() {
                    PluginsRunner.prototype.getDefects.should.be.called;
                });
        });

        it('should make a report', function() {
            PluginsRunner.prototype.getDefects.returns([{msg: 'first-error'}, {msg: 'second-error'}]);

            return bemhint([], {reporters: ['flat']})
                .then(function() {
                    flatReporter.write.should.be.calledWith([{msg: 'first-error'}, {msg: 'second-error'}]);
                });
        });

        it('should return defects', function() {
            PluginsRunner.prototype.getDefects.returns([{msg: 'first-error'}, {msg: 'second-error'}]);

            return bemhint().should.become([{msg: 'first-error'}, {msg: 'second-error'}]);
        });

        it('should sort defects by path', function() {
            PluginsRunner.prototype.getDefects.returns([{path: 'b'}, {path: 'c'}, {path: 'a'}]);

            return bemhint()
                .then(function() {
                    flatReporter.write.should.be.calledWith([{path: 'a'}, {path: 'b'}, {path: 'c'}]);
                });
        });

        it('should scan levels –> run plugins –> get defects –> make reports', function() {
            return bemhint()
                .then(function() {
                    scanner.scan.should.be.called;
                    PluginsRunner.prototype.runPlugin.should.be.calledAfter(scanner.scan);
                    PluginsRunner.prototype.getDefects.should.be.calledAfter(PluginsRunner.prototype.runPlugin);
                    flatReporter.write.should.be.calledAfter(PluginsRunner.prototype.getDefects);
                });
        });
    });

    it('should group scanned techs by entities', function() {
        sandbox.stub(scanner, 'scan').callsFake(() => Promise.resolve([
            {entity: {block: 'some-block'}, level: 'some-level', tech: 'js'},
            {entity: {block: 'some-block'}, level: 'some-level', tech: 'css'},
            {entity: {block: 'some-block', elem: 'some-elem'}, level: 'some-level', tech: 'js'},
            {entity: {block: 'some-block'}, level: 'another-level', tech: 'js'}
        ]));

        return bemhint()
            .then(function() {
                PluginsRunner.prototype.__constructor
                    .should.be.calledWith([
                        [
                            {entity: {block: 'some-block'}, level: 'some-level', tech: 'js'},
                            {entity: {block: 'some-block'}, level: 'some-level', tech: 'css'}
                        ],
                        [
                            {entity: {block: 'some-block', elem: 'some-elem'}, level: 'some-level', tech: 'js'}
                        ],
                        [
                            {entity: {block: 'some-block'}, level: 'another-level', tech: 'js'}
                        ]
                    ]);
            });
    });
});
