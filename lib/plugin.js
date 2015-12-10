var inherit = require('inherit');

/**
 * @class
 * @name Plugin
 */
module.exports = inherit({
    /**
     * @constructor
     * @param {String} path
     * @param {Object} config
     */
    __constructor: function(path, config) {
        this.config = config;

        this._module = require(path);
    },

    /**
     * @param {Entity[]} entities
     * @public
     */
    run: function(entities) {
        return this._module.call(this, entities, this.config);
    }
});
