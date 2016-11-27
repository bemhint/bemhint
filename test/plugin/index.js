var sinon = require('sinon'),
    Entity = require('../../lib/entity'),
    Plugin = require('../../lib/plugin'),
    PluginConfig = require('../../lib/plugin/config');

describe('Plugin.prototype', function() {
    describe('.run', function() {
        var spy,
            instanceOfPluginConfig = sinon.match.instanceOf(PluginConfig);

        function createPlugin_(opts) {
            var plugin = new Plugin(require.resolve('../fixtures/plugins/' + opts.name), {
                userConfig: opts.config || true
            });

            spy = sinon.spy(plugin._module, opts.method || opts.name);

            return plugin;
        }

        ///
        function createEntities_(entities) {
            return entities.map(function(techs) {
                return new Entity(techs.map(function(item) {
                    return typeof item === 'string' ? {name: item} : item;
                }));
            });
        }

        afterEach(function() {
            spy.restore();
        });

        it('should run for entities', function() {
            var entities = createEntities_([['some-tech', 'another-tech']]);

            createPlugin_({name: 'forEntities'}).run(entities);

            spy.should.be.calledWith(entities, instanceOfPluginConfig);
        });

        it('should run for each entity', function() {
            var entities = createEntities_([['some-tech', 'another-tech'], ['another-tech', 'some-tech']]);

            createPlugin_({name: 'forEachEntity'}).run(entities);

            spy.firstCall.should.be.calledWith(entities[0], instanceOfPluginConfig);
            spy.secondCall.should.be.calledWith(entities[1], instanceOfPluginConfig);
        });

        it('should run for each entity which is not excluded in a custom config', function() {
            var entities = createEntities_([
                [{name: 'some-tech', path: 'some/path/file.some-tech'}],
                [{name: 'another-tech', path: 'some/another-path/file.another-tech'}]
            ]);

            createPlugin_({name: 'forEachEntity', config: {excludePaths: ['some/another-path/*']}}).run(entities);

            spy.should.be.calledOnce;
            spy.should.be.calledWith(entities[0]);
        });

        it('should run for each entity which is not excluded in a predefined config', function() {
            var entities = createEntities_([
                [{name: 'some-tech', path: 'some/path/file.some-tech'}],
                [{name: 'another-tech', path: 'some/another-path/file.another-tech'}]
            ]);

            createPlugin_({name: 'forEachEntity-exclude-paths', method: 'forEachEntity'}).run(entities);

            spy.should.be.calledOnce;
            spy.should.be.calledWith(entities[0]);
        });

        it('should run for each tech', function() {
            var entities = createEntities_([['some-tech'], ['another-tech']]);

            createPlugin_({name: 'forEachTech'}).run(entities);

            spy.firstCall.should.be.calledWith({name: 'some-tech'}, entities[0], instanceOfPluginConfig);
            spy.secondCall.should.be.calledWith({name: 'another-tech'}, entities[1], instanceOfPluginConfig);
        });

        it('should run for each tech which is specified in a custom config', function() {
            var entities = createEntities_([['some-tech'], ['another-tech']]);

            createPlugin_({name: 'forEachTech', config: {techs: {'some-tech': true}}}).run(entities);

            spy.should.be.calledOnce;
            spy.should.be.calledWith({name: 'some-tech'}, entities[0]);
        });

        it('should run for each tech which is specified in a predefined config', function() {
            var entities = createEntities_([['some-tech'], ['another-tech']]);

            createPlugin_({name: 'forEachTech-techs', method: 'forEachTech'}).run(entities);

            spy.should.be.calledOnce;
            spy.should.be.calledWith({name: 'some-tech'}, entities[0]);
        });

        it('should run for each tech which is not excluded in a custom config', function() {
            var entities = createEntities_([
                [{name: 'some-tech', path: 'some/path/file.some-tech'}],
                [{name: 'another-tech', path: 'some/another-path/file.another-tech'}]
            ]);

            createPlugin_({name: 'forEachTech', config: {excludePaths: ['some/another-path/*']}}).run(entities);

            spy.should.be.calledOnce;
            spy.should.be.calledWith({name: 'some-tech', path: 'some/path/file.some-tech'}, entities[0]);
        });

        it('should run for each tech which is not excluded in a predefined config', function() {
            var entities = createEntities_([
                [{name: 'some-tech', path: 'some/path/file.some-tech'}],
                [
                    {name: 'another-tech', path: 'some/another-path/file.another-tech'},
                    {name: 'some-tech', path: 'some/another-path/file.some-tech'}
                ]
            ]);

            createPlugin_({name: 'forEachTech-exclude-paths', method: 'forEachTech'}).run(entities);

            spy.should.be.calledTwice;
            spy.firstCall.should.be.calledWith({name: 'some-tech', path: 'some/path/file.some-tech'}, entities[0]);
            spy.secondCall.should.be.calledWith({name: 'some-tech', path: 'some/another-path/file.some-tech'}, entities[1]);
        });
    });
});
