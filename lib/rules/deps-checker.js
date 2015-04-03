/**
 * DepsChecker
 * ===========
 */
var vm = require('vm'),
    inherit = require('inherit'),
    _ = require('lodash'),
    Checker = require('../checker'),
    utils = require('../utils');

/**
 * @name DepsChecker
 * @class
 */
module.exports = inherit(Checker, {
    /**
     * Checks the given entity on the correctness of the written deps
     * @example
     * Returns undefined if the deps were written correctly, otherwise:
     * {
     *     path: <path to the incorrect deps file>
     *     actual: <actual written deps>
     *     expected: <expected deps to be written>
     * }
     * @param {Object[]} entity
     * @returns {Object|false}
     * @private
     */
    checkEntity: function (entity) {
        var depsJs = entity['deps.js'],
            entityInfo = this._getEntityInfo(entity),
            actualDeps = this._getActualDeps(depsJs),
            expectedDeps = this._getExpectedDeps(entity.js, entity.bemhtml),
            isEqual = this._isEqual(actualDeps, expectedDeps);

        return !isEqual && {
            path: depsJs ? depsJs.path : entityInfo.path,
            actual: depsJs ? actualDeps : 'No deps file ' + entityInfo.basename + 'deps.js',
            expected: _.isEmpty(expectedDeps.elems) ? _.omit(expectedDeps, 'elems') : expectedDeps
        };
    },

    /**
     * Returns the actual deps from the given deps file
     * @example
     * { block: 'i-bem', elems: ['dom', 'html', 'i18n'] }
     * @param {String|undefined} depsJs
     * @returns {Object}
     * @private
     */
    _getActualDeps: function (depsJs) {
        var deps = depsJs ? vm.runInThisContext(depsJs.content) : {};

        return _(deps)
            .thru(utils.wrapIntoArray)
            .filter(function (item) {
                return !item.hasOwnProperty('tech') && item.hasOwnProperty('mustDeps');
            })
            .pluck('mustDeps')
            .flatten()
            .find(function (item) {
                return item === 'i-bem' || item.block === 'i-bem';
            }) || {};
    },

    /**
     * Returns the expected deps based on the given js and bemhtml files' contents
     * @example
     * { block: 'i-bem', elems: ['dom', 'html', 'i18n'] }
     * @param {String|undefined} js
     * @param {String|undefined} bemhtml
     * @returns {Object}
     * @private
     */
    _getExpectedDeps: function (js, bemhtml) {
        var jsContent = js ? js.content : '',
            bemhtmlContent = bemhtml ? bemhtml.content : '';

        /**
         * @returns {String[]}
         */
        function _getElems() {
            var elemsRegExp = {
                    dom: /BEM\.DOM/.test(jsContent),
                    html: /BEM\.HTML/.test(jsContent) || bemhtmlContent,
                    internal: /BEM\.INTERNAL/.test(jsContent),
                    i18n: /BEM\.I18N\(/.test(jsContent) || /BEM\.I18N\(/.test(bemhtmlContent) ||
                        /block\s*:\s*'i-bem'\s*,\s*elem\s*:\s*'i18n'/.test(bemhtmlContent)
                };

            return _(elemsRegExp)
                .map(function (value, key) {
                    if (value) return key;
                })
                .compact()
                .value();
        }

        var elems = _getElems();

        if (/BEM\.decl\(/.test(jsContent) || !_.isEmpty(elems)) {
            return { block: 'i-bem', elems: elems };
        }

        return {};
    },

    /**
     * Checks the equality of the given actual and expected deps
     * @param {Object} actualDeps
     * @param {Object} expectedDeps
     * @returns {Boolean}
     * @private
     */
    _isEqual: function (actualDeps, expectedDeps) {
        var normalizedDeps = this._normalizeDeps(actualDeps);

        if (normalizedDeps.block === expectedDeps.block) {
            return !_.xor(normalizedDeps.elems, expectedDeps.elems).length;
        }

        return false;
    },

    /**
     * Normalizes the given actual deps, i.e. transforms them to a comparable form with expected deps
     * @param {Object} deps
     * @returns {Object}
     */
    _normalizeDeps: function (deps) {
        /**
         * @param {Object} deps
         * @returns {String[]}
         */
        function _getElems(deps) {
            if (deps.hasOwnProperty('elem')) {
                return [deps.elem];
            }

            if (deps.hasOwnProperty('elems')) {
                return utils.wrapIntoArray(deps.elems);
            }

            return [];
        }

        /**
         * @param {Object|String} elem
         * @returns {String|undefined}
         */
        function _handleElem(elem) {
            if (typeof elem === 'string') {
                return elem;
            }

            if (_.isPlainObject(elem) && elem.hasOwnProperty('name')) {
                return elem.name;
            }
        }

        if (typeof deps === 'string') {
            return { block: deps };
        }

        if (!deps.hasOwnProperty('block')) return {};

        return _(_getElems(deps))
            .map(_handleElem)
            .compact()
            .thru(function (elems) {
                return {
                    block: deps.block,
                    elems: elems
                };
            })
            .value();
    }
});
