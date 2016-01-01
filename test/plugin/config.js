var PluginConfig = require('../../lib/plugin/config');

describe('PluginConfig', function() {
    function createConfig_(opts) {
        return new PluginConfig(
            opts.path || 'some-path',
            opts.hasOwnProperty('customConfig') ? opts.customConfig : true,
            opts.predefinedConfig
        );
    }

    it('should use predefined config if it is specified', function() {
        createConfig_({predefinedConfig: function() {return {'some-key': 'some-val'};}})
            .getConfig().should.be.eql({'some-key': 'some-val', techs: {'*': {}}});
    });

    it('should throw if predefined config is invalid', function() {
        (function() {
            createConfig_({path: 'plugin-path', predefinedConfig: function() {return 'bad config';}});
        }).should.throw('Invalid config for plugin plugin-path');
    });

    it('should use a custom config if a predefined config is not specified', function() {
        createConfig_({customConfig: {'some-key': 'some-val'}})
            .getConfig().should.be.eql({'some-key': 'some-val', techs: {'*': {}}});
    });

    it('should throw if a custom config is invalid and a predefined config is not specified', function() {
        (function() {
            createConfig_({path: 'plugin-path', customConfig: 'bad config'});
        }).should.throw('Invalid config for plugin plugin-path');
    });

    it('should consifer `false` value as a `false` config', function() {
        createConfig_({customConfig: false}).getConfig().should.be.false;
    });

    it('should consider `true` value as a default config', function() {
        createConfig_({customConfig: true}).getConfig().should.be.eql({techs: {'*': {}}});
    });

    describe('techs config', function() {
        function createTechsConfig(techsConfigs) {
            return new PluginConfig('some-path', {techs: techsConfigs});
        }

        it('should properly work for `{*: true}`', function() {
            createTechsConfig({'*': true}).getTechConfig('some-tech').should.be.eql({});
        });

        it('should allow to express white list', function() {
            var config = createTechsConfig({'*': false, 'some-tech': true});

            config.getTechConfig('some-tech').should.be.eql({});
            config.getTechConfig('another-tech').should.be.false;
        });

        it('should consifer omitting of `*` as `{*: false}`', function() {
            var config = createTechsConfig({'some-tech': true});

            config.getTechConfig('some-tech').should.be.eql({});
            config.getTechConfig('another-tech').should.be.false;
        });

        it('should allow to express black list', function() {
            var config = createTechsConfig({'*': true, 'some-tech': false});

            config.getTechConfig('some-tech').should.be.false;
            config.getTechConfig('another-tech').should.be.eql({});
        });

        it('should properly merge configs', function() {

        });
    });
});
