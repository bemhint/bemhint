var path = require('path'),
    inherit = require('inherit'),
    _ = require('lodash'),
    minimatch = require('minimatch');

/**
 * @class
 * @name Config
 */
module.exports = inherit({
    /**
     * @constructor
     * @param {Object}   config
     * @param {String[]} config.levels – masks for redefinition levels
     * @param {String[]} config.exludeFiles - masks for files to be ignored
     * @param {String[]} config.techsWithLevels – techs which contain redefinition levels
     * @param {String[]} config.rules – rules from the folder ./lib/rules/*.js
     * @param {String[]} config.plugins – rules from `node_modules`
     * @param {String[]} config.targets –  dirs to check
     * @param {String[]} config.reporters – html or/and flat
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
     * @param {String} path
     * @returns {Boolean}
     * @public
     */
    isExcludingPath: function(path) {
        return someMinimatch(this._excludePaths, path);
    },

    /**
     * @param {String} path
     * @returns {Boolean}
     * @public
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
     * @param {String} level
     * @returns {Boolean}
     * @public
     */
    isTargetLevel: function(level) {
        return someMinimatch(this._levels, level);
    },

    /**
     * @returns {Object}
     * @public
     */
    getChecks: function() {
        return {
            rules: this._rules,
            plugins: this._plugins
        };
    }
});

/**
 * @param {String[]} masks
 * @param {String} path
 * @returns {Boolean}
 */
function someMinimatch(masks, path) {
    return _.some(masks, function(mask) {
        return minimatch(path, mask);
    });
}
