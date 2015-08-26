var walk = require('bem-walk'),
    naming = require('bem-naming'),
    vow = require('vow');

/**
 * @typedef {Object} WalkedTech
 * @property {String} entityId - a string in format <level>@<stringified_entity> (some.blocks@block__elem_modName)
 * @property {String} name
 * @property {String} path
 */

/**
 * @param {String[]} targets
 * @returns {Promise * WalkedTech[]}
 */
module.exports = function(targets) {
    var walker = walk(targets),
        defer = vow.defer(),
        result = [];

    walker.on('data', function(data) {
        result.push({
            entityId: data.level + '@' + naming.stringify(data.entity),
            name: data.tech,
            path: data.path
        });
    });

    walker.on('error', function(error) {
        defer.reject(error);
    });

    walker.on('end', function() {
        defer.resolve(result);
    });

    return defer.promise();
};
