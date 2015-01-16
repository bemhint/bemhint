/**
 * Configuration
 * -------------
 */
var inherit = require('inherit'),
    path = require('path');

var minimatch = require('minimatch');

/**
 * @name Configuration
 * @class
 */
module.exports = inherit({
    /**
     * Constructor
     * @param {Object} [config]
     * @param {String} [config.configPath]
     * @param {Array}  [config.excludeFiles]
     */
    __constructor: function (config) {
        this._basePath = path.dirname(config.configPath);

        this._excludeFiles = this._revealExcludeFiles(config.excludeFiles || []);
    },

    /**
     * Normalize the given masks relatively to the base path and reveals them
     * @param {Array} masks
     * @returns {Minimatch[]}
     * @private
     */
    _revealExcludeFiles: function (masks) {
        return masks.map(function (mask) {
            return new minimatch.Minimatch(path.normalize(this._basePath + '/' + mask), {
                dot: true
            });
        }, this);
    },

    /**
     * Returns excluding paths
     * @returns {Array}
     * @public
     */
    getExcludeFiles: function () {
        return this._excludeFiles;
    }
});
