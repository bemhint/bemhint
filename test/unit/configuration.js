var Configuration = require('../../lib/configuration'),
    minimatch = require('minimatch');

describe('configuration', function () {
    it('must get exclude files', function () {
        var config = new Configuration({
            excludeFiles: ['*.blocks/**/*.tech1', '*.blocks/**/*.tech2'],
            configPath: 'path/to/config/config.js'
        });

        var output = [
            'path/to/config/*.blocks/**/*.tech1',
            'path/to/config/*.blocks/**/*.tech2'
        ].map(function (item) {
            return new minimatch.Minimatch(item, {
                dot: true
            });
        });

        config.getExcludeFiles().must.be.eql(output);
    });

    it('must get levels', function () {
        var config = new Configuration({
            levels: ['*.blocks'],
            configPath: 'config.js'
        });

        var output = [new RegExp('.*\\.blocks(/|$)', 'g')];

        config.getLevels().must.be.eql(output);
    });
});
