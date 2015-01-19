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
     * @param {Array}  [config.levels]
     * @param {Array}  [config.excludeFiles]
     */
    __constructor: function (config) {
        this._basePath = path.dirname(config.configPath);

        this._levels = this._revealLevels(config.levels || []);
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

    _revealLevels: function (masks) {
        var revealed = [],
            notSpecial = new RegExp('[A-Za-z_]', 'g');

        masks.forEach(function (mask) {
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

            revealed.push(new RegExp(revealedMask + '(/|$)', 'g'));
        });

        return revealed;
    },

    /**
     * Returns excluding paths
     * @returns {Array}
     * @public
     */
    getExcludeFiles: function () {
        return this._excludeFiles;
    },

    /**
     * Returns levels' templates
     * @returns {Array}
     */
    getLevels: function () {
        return this._levels;
    }
});
