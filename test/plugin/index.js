var sinon = require('sinon'),
    Entity = require('../../lib/entity'),
    Plugin = require('../../lib/plugin'),
    PluginConfig = require('../../lib/plugin/config');

describe('Plugin.prototype', function() {
    describe('.run', function() {
        var spy,
            instanceOfPluginConfig = sinon.match.instanceOf(PluginConfig);

        function createPlugin(path, config, stubMethod) {
            var plugin = new Plugin(require.resolve('../fixtures/plugins/' + path), config);

            spy = sinon.spy(plugin._module, stubMethod || path);

            return plugin;
        }

        ///
        function createEntities(entities) {
            return entities.map(function(techs) {
                return new Entity(techs.map(function(techName) {
                    return {name: techName};
                }));
            });
        }

        afterEach(function() {
            spy.restore();
        });

        it('should run for entities', function() {
            var entities = createEntities([['some-tech', 'another-tech']]);

            createPlugin('forEntities', true).run(entities);

            spy.should.be.calledOnce;
            spy.should.be.calledWithMatch(entities, instanceOfPluginConfig);
        });

        it('should run for each entity', function() {
            var entities = createEntities([['some-tech', 'another-tech'], ['another-tech', 'some-tech']]);

            createPlugin('forEachEntity', true).run(entities);

            spy.should.be.calledTwice;
            spy.firstCall.should.be.calledWith(entities[0], instanceOfPluginConfig);
            spy.secondCall.should.be.calledWith(entities[1], instanceOfPluginConfig);
        });

        it('should run for each tech', function() {
            var entities = createEntities([['some-tech'], ['another-tech']]);

            createPlugin('forEachTech', true).run(entities);

            spy.should.be.calledTwice;
            spy.firstCall.should.be.calledWith({name: 'some-tech'}, entities[0], instanceOfPluginConfig);
            spy.secondCall.should.be.calledWith({name: 'another-tech'}, entities[1], instanceOfPluginConfig);
        });

        it('should run only for techs specified in a custom config', function() {
            var entities = createEntities([['some-tech'], ['another-tech']]);

            createPlugin('forEachTech', {techs: {'some-tech': true}}).run(entities);

            spy.should.be.calledOnce;
            spy.should.be.calledWith({name: 'some-tech'}, entities[0], instanceOfPluginConfig);
        });

        it('should run only for techs specified in a predefined config', function() {
            var entities = createEntities([['some-tech'], ['another-tech']]);

            createPlugin('forEachTech-config', true, 'forEachTech').run(entities);

            spy.should.be.calledOnce;
            spy.should.be.calledWith({name: 'some-tech'}, entities[0], instanceOfPluginConfig);
        });
    });
});
