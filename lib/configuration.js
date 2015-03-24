/**
 * Configuration
 * -------------
 */
var inherit = require('inherit'),
    path = require('path'),
    minimatch = require('minimatch');

/**
 * @name Configuration
 * @class
 */
module.exports = inherit({
    /**
     * Constructor
     * @param {Object}   [config]
     * @param {String}   [config.configPath]
     * @param {String[]} [config.levels]
     * @param {String[]} [config.excludeFiles]
     */
    __constructor: function (config) {
        this._basePath = path.dirname(config.configPath);

        this._levels = this._revealLevels(config.levels || []);
        this._excludeFiles = this._revealExcludeFiles(config.excludeFiles || []);
    },

    /**
     * Normalizes the given masks relatively to the base path and reveals them
     * @param {String[]} masks
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
     * Reveals the given levels' masks
     * @param {String[]} masks
     * @returns {RegExp[]}
     * @private
     */
    _revealLevels: function (masks) {
        var notSpecial = /[A-Za-z_]/g;

        return masks.map(function (mask) {
            var revealedMask = '';
            for (var i = 0; i < mask.length; i++) {
                if (mask[i].match(notSpecial)) {
                    revealedMask += mask[i];
                } else if (mask[i] === '*') {
                    revealedMask += '.*';
                } else {
                    revealedMask += '\\' + mask[i];
                }
            }

            return new RegExp(revealedMask + '(/|$)', 'g');
        });
    },

    /**
     * Returns excluding paths
     * @returns {Minimatch[]}
     * @public
     */
    getExcludeFiles: function () {
        return this._excludeFiles;
    },

    /**
     * Returns levels' templates
     * @returns {RegExp[]}
     * @public
     */
    getLevels: function () {
        return this._levels;
    }
});
