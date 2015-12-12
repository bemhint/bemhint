var sinon = require('sinon'),
    Entity = require('../lib/entity'),
    Plugin = require('../lib/plugin');

describe('Plugin.prototype', function() {
    ///
    function createEntities(entities) {
        return entities.map(function(techs) {
            return new Entity(techs.map(function(techName) {
                return {name: techName};
            }));
        });
    }

    describe('.run', function() {
        describe('techs config', function() {
            var spy;

            function createPlugin(config) {
                var plugin = new Plugin(require.resolve('./fixtures/plugins/some-plugin'), config);

                spy = sinon.spy(plugin._module, 'forEntityTech');

                return plugin;
            }

            function runPlugin(techsConfig, entities) {
                var plugin = createPlugin({techs: techsConfig});

                plugin.run(createEntities(entities));
            }

            afterEach(function() {
                spy.restore();
            });

            it('should properly work for `*`', function() {
                runPlugin({'*': true}, [['some-tech']]);

                spy.should.be.calledWith(sinon.match.any, {});
            });

            it('should allow to express white list', function() {
                runPlugin({'*': false, 'some-tech': true}, [['some-tech', 'another-tech'], ['one-more-tech']]);

                spy.should.be.calledOnce;
                spy.should.be.calledWith({name: 'some-tech'});
            });

            it('should allow to express black list', function() {
                runPlugin({'*': true, 'some-tech': false}, [['some-tech', 'another-tech'], ['one-more-tech']]);

                spy.should.be.calledTwice;
                spy.should.not.be.calledWith({name: 'some-tech'});
            });

            it('should properly merge techs configs', function() {
                runPlugin(
                    {
                        '*': {a: 1},
                        'some-tech': {b: 2},
                        'some-tech|another-tech': {c: 3},
                        'another-tech': false
                    },
                    [['some-tech', 'another-tech']]
                );

                spy.should.be.calledOnce;
                spy.should.be.calledWith({name: 'some-tech'}, {a: 1, b: 2, c: 3});
            });

            it('should properly work without techs config', function() {
                runPlugin(undefined, [['some-tech', 'another-tech'], ['one-more-tech']]);

                spy.should.be.calledThrice;
            });
        });
    });
});
