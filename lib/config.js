var inherit = require('inherit'),
    _ = require('lodash'),
    minimatch = require('minimatch'),
    path = require('path');

/**
 *
 */
module.exports = inherit({
    /**
     *
     */
    __constructor: function(config) {
        this._basePath = path.dirname(config.configPath);

        this._excludePaths = config.excludePaths;
        this._levels = config.levels;

        this._rules = config.rules;
        this._plugins = config.plugins;

        this.targets = config.targets;
        this.reporters = config.reporters;
        this.techsWithLevels = config.techsWithLevels;
    },

    /**
     *
     */
    isExcludingPath: function(path) {
        return someMinimatch(this._excludePaths, path);
    },

    /**
     *
     */
    isTargetPath: function(path) {
        return _.some(this.targets, function(target) {
            if(path === '.') {
                return true;
            }

            return _.contains(path, target);
        });
    },

    /**
     *
     */
    isTargetLevel: function(level) {
        return someMinimatch(this._levels, level);
    },

    /**
     *
     */
    getChecks: function() {
        return {
            rules: this._rules,
            plugins: this._plugins
        };
    }
});

/**
 *
 */
function someMinimatch(masks, path) {
    return _.some(masks, function(mask) {
        return minimatch(path, mask);
    });
}
