/**
 * The core of BEM hint
 * ====================
 */
var path = require('path'),
    depsChecker = require('./checker/deps-checker'),
    scan = require('./walk'),
    utils = require('./utils');

/**
 * Loads the file list and checks it
 * @param {Object} [config]
 * @param {Array}  [config.levels]
 * @param {String} target
 * @returns {Promise * Array} - the list of BEM errors
 */
module.exports = function (config, target) {
    var levels = config.levels.map(function (level) {
        return path.join(target, level);
    });

    return scan(levels)
        .then(function (entities) {
            entities = utils.filterByTechs(entities, ['js', 'bemhtml', 'deps.js']);

            return depsChecker.check(entities);
        });
};
