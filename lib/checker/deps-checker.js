/**
 * DepsChecker
 * ===========
 */
var vm = require('vm'),
    utils = require('./utils');

/**
 * Checks the given entity on the correctness of the written deps
 * @example
 * Returns an empty object if the deps were written correctly, otherwise:
 * {
 *     fullpath: <path to the incorrect deps file>
 *     actualDeps: <actual written deps>
 *     expectedDeps: <expected deps to be written>
 * }
 * @param {Array} entity
 * @returns {Object}
 */
function _checkDeps(entity) {
    var files = {},
        entityInfo = {};

    entity.forEach(function (file) {
        entityInfo.path = file.path.substring(0, file.path.lastIndexOf('/'));
        entityInfo.depsName =  file.name.substring(0, file.name.lastIndexOf(file.tech)) + 'deps.js';

        if (file.tech === 'deps.js') files.deps = file;
        if (file.tech === 'js') files.js = file.content;
        if (file.tech === 'bemhtml') files.bemhtml = file.content;
    });

    var actualDeps = utils.getActualDeps(files.deps ? vm.runInThisContext(files.deps.content) : ''),
        expectedDeps = utils.getExpectedDeps(files.js || '', files.bemhtml || '');

    var isEqual = utils.isEqual(actualDeps, expectedDeps);

    return !isEqual ? {
        fullpath: files.deps ? files.deps.path : entityInfo.path,
        actualDeps: files.deps ? actualDeps : 'No deps file ' + entityInfo.depsName,
        expectedDeps: expectedDeps
    } : {};
}

/**
 * Checker
 * -------
 */
module.exports = {
    /**
     * Checks the given files
     * @param {Array} entities
     * @returns {Array}
     */
    check: function (entities) {
        var errors = [];

        Object.keys(entities).forEach(function (item) {
            var err = _checkDeps(entities[item]);

            Object.keys(err).length && errors.push(err);
        });

        return utils.sortByFullpath(errors);
    }
};
