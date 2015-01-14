/**
 * The core of BEM hint
 * ====================
 */
var depsChecker = require('./checker/deps-checker'),
    scan = require('./walk'),
    utils = require('./utils');

/**
 * Loads the file list and checks it
 * @param {Object} [config]
 * @param {Array}  [config.levels]
 * @returns {Promise * Array} - the list of BEM errors
 */
module.exports = function (config) {
    var levels = config.levels;

    return scan(levels)
        .then(function (entities) {
            entities = utils.filterByTechs(entities, ['js', 'bemhtml', 'deps.js']);

            return depsChecker.check(entities);
        });
};
