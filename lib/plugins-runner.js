var inherit = require('inherit'),
    _ = require('lodash'),
    Entity = require('./entity');

/**
 * @class
 * @name PluginsRunner
 */
var PluginsRunner = inherit({
    /**
     * @typedef {Object} Notation
     * @property {String} block
     * @property {String} [elem]
     * @property {String} [modName]
     * @property {String} [modVal]
     */

    /**
     * @typedef {Object} Tech
     * @property {Notation} entity
     * @property {String} level
     * @property {String} name
     * @property {String} path
     * @property {String} [content]
     */

    /**
     * @typedef {Tech[]} Techs
     */

    /**
     * @constructor
     * @param {Techs[]} entities
     */
    __constructor: function(entities) {
        entities = entities || [];

        this._entities = PluginsRunner.initEntities(entities);
    },

    /**
     * @param {Plugin} plugin
     * @public
     */
    runPlugin: function(plugin) {
        return plugin.run(this._entities);
    },

    /**
     * @typedef {Object} Error
     * @property {String} path
     * @property {String} msg
     * @property {Object|String} [value]
     */

    /**
     * @returns {Error[]}
     * @public
     */
    getErrors: function() {
        return _(this._entities)
            .map(function(entity) {
                return entity.getErrors();
            })
            .flatten()
            .value();
    }
}, {
    /**
     * @param {Techs[]} entities
     * @returns {Entity[]}
     * @static
     */
    initEntities: function(entities) {
        return _.map(entities, function(techs) {
            return new Entity(techs);
        });
    }
});

module.exports = PluginsRunner;
