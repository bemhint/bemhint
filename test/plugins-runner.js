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
        describe('.getErrors', function() {
            beforeEach(function() {
                sandbox.stub(Entity.prototype, 'getErrors');
            });

            it('should get errors', function() {
                pluginsRunner = new PluginsRunner([[{tech: 'some.tech'}]]);

                Entity.prototype.getErrors.returns([{msg: 'some-msg', path: 'some/path/some.tech'}]);

                pluginsRunner.getErrors().should.be.eql([{msg: 'some-msg', path: 'some/path/some.tech'}]);
            });

            it('should get errors from several entities', function() {
                pluginsRunner = new PluginsRunner([[{tech: 'first-entity.tech'}], [{tech: 'second-entity.tech'}]]);

                Entity.prototype.getErrors
                    .onFirstCall().returns([{msg: 'first-msg', path: 'some/path/some.first-entity.tech'}])
                    .onSecondCall().returns([{msg: 'second-msg', path: 'some/path/some.second-entity.tech'}]);

                pluginsRunner.getErrors()
                    .should.be.eql([
                        {msg: 'first-msg', path: 'some/path/some.first-entity.tech'},
                        {msg: 'second-msg', path: 'some/path/some.second-entity.tech'}
                    ]);
            });
        });
    });
});
