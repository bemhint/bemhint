var PluginConfig = require('../../lib/plugin/config');

describe('PluginConfig', function() {
    function createConfig_(opts) {
        return new PluginConfig(
            opts.path || 'some-path',
            {
                predefinedConfig: opts.predefinedConfig,
                userConfig: opts.hasOwnProperty('customConfig') ? opts.customConfig : true,
                baseConfig: opts.baseConfig
            }
        );
    }

    it('should use predefined config if it is specified', function() {
        createConfig_({predefinedConfig: {'some-key': 'some-val'}})
            .getConfig().should.be.eql({'some-key': 'some-val', techs: {'*': {}}});
    });

    it('should throw if predefined config is invalid', function() {
        (function() {
            createConfig_({path: 'plugin-path', predefinedConfig: 'bad config'});
        }).should.throw('Invalid config for plugin plugin-path');
    });

    it('should use a custom config if a predefined config is not specified', function() {
        createConfig_({customConfig: {'some-key': 'some-val'}})
            .getConfig().should.be.eql({'some-key': 'some-val', techs: {'*': {}}});
    });

    it('should throw if a custom config is invalid', function() {
        (function() {
            createConfig_({path: 'plugin-path', customConfig: 'bad config'});
        }).should.throw('Invalid config for plugin plugin-path');
    });

    it('should merge custom and predefined configs in right order', function() {
        createConfig_({customConfig: {a: 1, b: 5}, predefinedConfig: {b: 2, c: 3}})
            .getConfig().should.be.eql({a: 1, b: 5, c: 3, techs: {'*': {}}});
    });

    it('should consider `false` value as a `false` config', function() {
        createConfig_({customConfig: false}).getConfig().should.be.false;
    });

    it('should consider `true` value as a default config', function() {
        createConfig_({customConfig: true}).getConfig().should.be.eql({techs: {'*': {}}});
    });

    it('should resolve path', function() {
        createConfig_({baseConfig: {configDir: '/foo/bar'}}).resolvePath('baz').should.be.eql('/foo/bar/baz');
    });

    describe('techs config', function() {
        function createTechsConfig(techsConfigs) {
            return new PluginConfig('some-path', {userConfig: {techs: techsConfigs}}, {});
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
