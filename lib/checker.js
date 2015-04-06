var path = require('path'),
    inherit = require('inherit'),
    _ = require('lodash');

/**
 * @name Checker
 * @class
 */
module.exports = inherit({
    /**
     * Checks the given entities
     * @param {Object} entities
     * @returns {Object[]}
     * @public
     */
    check: function (entities) {
        return _(entities)
            .map(this.checkEntity.bind(this))
            .compact()
            .value();
    },

    checkEntity: function () {
        throw 'Not implemented';
    },

    /**
     * Returns the info about the given entity
     * @param {Object} entity
     * @returns {Object}
     * @private
     */
    _getEntityInfo: function (entity) {
        return _(entity)
            .values()
            .thru(function (values) {
                var entityElem = _.first(values);
                return {
                    path: path.dirname(entityElem.path),
                    basename: path.basename(entityElem.name, '.' + entityElem.tech)
                };
            })
            .value();
    }
});
