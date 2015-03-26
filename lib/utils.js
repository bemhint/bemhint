/**
 * Utils
 * =====
 */
var path = require('path'),
    _ = require('lodash');

/**
 * @param {Object} entity
 * @returns {Object}
 */
function getEntityInfo(entity) {
    return _(entity)
        .values()
        .thru(function (values) {
            var entityElem = _.first(values);
            return {
                path: path.dirname(entityElem.path),
                basename: path.basename(entityElem.name, entityElem.tech)
            };
        })
        .value();
}

/**
 * Wraps something into an array
 * @param {*} smth
 * @returns {Object[]}
 */
function wrapIntoArray(smth) {
    return Array.isArray(smth) ? smth : [smth];
}

module.exports = {
    getEntityInfo: getEntityInfo,
    wrapIntoArray: wrapIntoArray
};
