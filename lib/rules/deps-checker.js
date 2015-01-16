/**
 * DepsChecker
 * ===========
 */
var vm = require('vm'),
    inherit = require('inherit'),
    _ = require('lodash');

/**
 * @name DepsChecker
 * @class
 */
module.exports = inherit({
    /**
     * Checks the given entities
     * @param {Object} entities
     * @returns {Array}
     */
    check: function (entities) {
        var depsErrors = [];

        _(entities).keys().forEach(function (entity) {
            var err = this._checkDeps(entities[entity]);

            _.keys(err).length && depsErrors.push(err);
        }, this);

        return depsErrors;
    },

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
    _checkDeps: function (entity) {
        var files = {},
            entityInfo = {};

        entity.forEach(function (file) {
            entityInfo.path = file.path.substring(0, file.path.lastIndexOf('/'));
            entityInfo.depsName =  file.name.substring(0, file.name.lastIndexOf(file.tech)) + 'deps.js';

            if (file.tech === 'deps.js') files.deps = file;
            if (file.tech === 'js') files.js = file.content;
            if (file.tech === 'bemhtml') files.bemhtml = file.content;
        });

        if (!_.keys(files).length) return {};

        var actualDeps = this._getActualDeps(files.deps ? vm.runInThisContext(files.deps.content) : ''),
            expectedDeps = this._getExpectedDeps(files.js || '', files.bemhtml || '');

        var isEqual = this._isEqual(actualDeps, expectedDeps);

        return !isEqual ? {
            fullpath: files.deps ? files.deps.path : entityInfo.path,
            actualDeps: files.deps ? actualDeps : 'No deps file ' + entityInfo.depsName,
            expectedDeps: expectedDeps
        } : {};
    },

    /**
     * Returns the actual deps from the given deps file
     * @example
     * { block: 'i-bem', elems: ['dom', 'html', 'i18n'] }
     * @param {Array|Object} deps
     * @returns {Object}
     */
    _getActualDeps: function (deps) {
        deps = _.isArray(deps) ? deps : [deps];

        var actualDeps = {};

        deps.forEach(function (blockOfDeps) {
            if (blockOfDeps.hasOwnProperty('tech') || !blockOfDeps.hasOwnProperty('mustDeps')) return;

            var mustDeps = blockOfDeps.mustDeps;

            mustDeps = _.isArray(mustDeps) ? mustDeps : [mustDeps];

            mustDeps.forEach(function (mustDep) {
                if (mustDep === 'i-bem') {
                    actualDeps.block = 'i-bem';
                    return;
                }

                if (mustDep.block === 'i-bem') {
                    actualDeps.block = 'i-bem';
                    actualDeps.elems = [];

                    if (mustDep.hasOwnProperty('elem')) {
                        if (typeof mustDep.elem === 'string') {
                            actualDeps.elems.push(mustDep.elem);
                        } else if (_.isPlainObject(mustDep.elem)) {
                            if (mustDep.elem.hasOwnProperty('name')) {
                                actualDeps.elems.push(mustDep.elem.name);
                            }
                        }
                    } else if (mustDep.hasOwnProperty('elems')) {
                        var elems = _.isArray(mustDep.elems) ? mustDep.elems : [mustDep.elems];

                        elems.forEach(function (elem) {
                            if (typeof elem === 'string') {
                                actualDeps.elems.push(elem);
                            } else if (_.isPlainObject(elem)) {
                                if (elem.hasOwnProperty('name')) {
                                    actualDeps.elems.push(elem.name);
                                }
                            }
                        });
                    }

                    !actualDeps.elems.length && delete actualDeps.elems;
                }
            });
        });

        return actualDeps;
    },

    /**
     * Returns the expected deps based on the given js and bemhtml files' contents
     * @example
     * { block: 'i-bem', elems: ['dom', 'html', 'i18n'] }
     * @param {String} jsContent
     * @param {String} bemhtmlContent
     * @returns {Object}
     */
    _getExpectedDeps: function (jsContent, bemhtmlContent) {
        var expectedDeps = {};

        var isDecl = /BEM\.decl\(/.test(jsContent),
            isDom = /BEM\.DOM/.test(jsContent),
            isHTML = /BEM\.HTML/.test(jsContent),
            isInternal = /BEM\.INTERNAL/.test(jsContent),
            i18n = new RegExp('BEM\\.I18N\\('),
            _i18n = new RegExp('block\\s*:\\s*\'i-bem\'\\s*,\\s*elem\\s*:\\s*\'i18n\''),
            is18n = i18n.test(jsContent) || i18n.test(bemhtmlContent) || _i18n.test(bemhtmlContent);

        if (isDecl || isDom || isHTML || bemhtmlContent || isInternal || is18n) {
            expectedDeps.block = 'i-bem';
            expectedDeps.elems = [];

            isDom && expectedDeps.elems.push('dom');
            (isHTML || bemhtmlContent) && expectedDeps.elems.push('html');
            isInternal && expectedDeps.elems.push('internal');
            is18n && expectedDeps.elems.push('i18n');

            !expectedDeps.elems.length && delete expectedDeps.elems;
        }

        return expectedDeps;
    },

    /**
     * Checks the equality of the given actual and expected deps
     * @param {Object} actualDeps
     * @param {Object} expectedDeps
     * @returns {Boolean}
     */
    _isEqual: function (actualDeps, expectedDeps) {
        if (actualDeps.block === expectedDeps.block) {
            return !_.xor(actualDeps.elems, expectedDeps.elems).length;
        }

        return false;
    }
});
