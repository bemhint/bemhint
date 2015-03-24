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
    var entityElem = _(entity).values().first();

    return {
        path: path.dirname(entityElem.path),
        basename: path.basename(entityElem.name, entityElem.tech)
    };
}

/**
 * Wraps something into an array
 * @param {*} smth
 * @returns {Object[]}
 */
function wrapIntoArray(smth) {
    return _.isArray(smth) ? smth : [smth];
}

module.exports = {
    getEntityInfo: getEntityInfo,
    wrapIntoArray: wrapIntoArray
};
