var sinon = require('sinon'),
    Entity = require('../lib/entity'),
    PluginsRunner = require('../lib/plugins-runner');

describe('PluginsRunner', function() {
    var sandbox = sinon.sandbox.create(),
        pluginsRunner;

    afterEach(function() {
        sandbox.restore();
    });

    describe('.initEntities', function() {
        beforeEach(function() {
            sandbox.stub(Entity.prototype, '__constructor');
        });

        it('should init entities', function() {
            var entities = PluginsRunner.initEntities([[{tech: 'some.tech'}]]);

            entities.should.have.length(1);
            entities[0].should.be.instanceOf(Entity);
            Entity.prototype.__constructor.should.be.calledWith([{tech: 'some.tech'}]);
        });
    });

    describe('.prototype', function() {
        describe('.getDefects', function() {
            beforeEach(function() {
                sandbox.stub(Entity.prototype, 'getDefects');
            });

            it('should get defects', function() {
                pluginsRunner = new PluginsRunner([[{tech: 'some.tech'}]]);

                Entity.prototype.getDefects.returns([{msg: 'some-msg', path: 'some/path/some.tech'}]);

                pluginsRunner.getDefects().should.be.eql([{msg: 'some-msg', path: 'some/path/some.tech'}]);
            });

            it('should get defects from several entities', function() {
                pluginsRunner = new PluginsRunner([[{tech: 'first-entity.tech'}], [{tech: 'second-entity.tech'}]]);

                Entity.prototype.getDefects
                    .onFirstCall().returns([{msg: 'first-msg', path: 'some/path/some.first-entity.tech'}])
                    .onSecondCall().returns([{msg: 'second-msg', path: 'some/path/some.second-entity.tech'}]);

                pluginsRunner.getDefects()
                    .should.be.eql([
                        {msg: 'first-msg', path: 'some/path/some.first-entity.tech'},
                        {msg: 'second-msg', path: 'some/path/some.second-entity.tech'}
                    ]);
            });
        });
    });
});
