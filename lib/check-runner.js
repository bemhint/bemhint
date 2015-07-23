var inherit = require('inherit'),
    _ = require('lodash'),
    deps = require('./deps-utils'),
    Entity = require('./entity');

/**
 * @class
 * @name CheckRunner
 */
module.exports = inherit({
    /**
     * @constructor
     * @param {Object} techs – a result of a work of ./lib/scanner/index.js
     */
    __constructor: function(techs) {
        this._entities = _.map(techs, initEntity);
    },

    /**
     * @typedef {Object} Error
     * @property {String} path
     * @property {String} msg
     * @property {Object[]} value
     */

    /**
     * @param {Function} rule
     * @returns {Error[]}
     * @public
     */
    check: function(rule) {
        return _(this._entities)
            .map(function(entity) {
                return this._runRule(rule, entity);
            }, this)
            .compact()
            .value();
    },

    /**
     * @param {Function} rule
     * @param {Entity} entity – see ./lib/entity.js
     * @returns {Error}
     * @public
     */
    _runRule: function(rule, entity) {
        var errors = rule.call(this, entity);
        if(!_.isEmpty(errors)) {
            return {
                path: entity.formatTechPath('deps.js'),
                msg: rule.errorMsg || 'Missing deps',
                value: deps.stringify(errors)
            };
        }
    },

    /**
     * @param {String} name
     * @returns {Entity} – see ./lib/entity.js
     * @public
     */
    findEntity: function(name) {
        return _.find(this._entities, {name: name});
    }
});

/**
 * @typedef {Object} Tech
 * @property {String} name
 * @property {String} path
 * @property {String} content
 * @property {String} entityId – a string in format <level>@<stringified_entity> (some.blocks@block__elem_modName)
 */

/**
 * @param {Tech} techs
 * @param {String} entityId – a string in format <level>@<stringified_entity> (some.blocks@block__elem_modName_modVal)
 * @returns {Entity} – see ./lib/entity.js
 */
function initEntity(techs, entityId) {
    var match = entityId.match(/(.*)@(.*)/),
        level = match[1],
        name = match[2];

    return new Entity(level, name, techs);
}
