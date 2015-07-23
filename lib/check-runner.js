var inherit = require('inherit'),
    _ = require('lodash'),
    deps = require('./deps-utils'),
    Entity = require('./entity');

/**
 *
 */
module.exports = inherit({
    /**
     *
     */
    __constructor: function(entities) {
        this._entities = _.map(entities, initEntity);
    },

    /**
     *
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
     *
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
     *
     */
    findEntity: function(name) {
        return _.find(this._entities, {name: name});
    }
});

/**
 *
 */
function initEntity(techs, entityId) {
    var match = entityId.match(/(.*)@(.*)/),
        level = match[1],
        name = match[2];

    return new Entity(level, name, techs);
}
