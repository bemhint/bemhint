/**
 * Utils
 * =====
 */
var _ = require('lodash');

/**
 * Returns the actual deps from the given deps file
 * @example
 * { block: 'i-bem', elems: ['dom', 'html', 'i18n'] }
 * @param {Array|Object} deps
 * @returns {Object}
 */
function getActualDeps(deps) {
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
}

/**
 * Returns the expected deps based on the given js and bemhtml files' contents
 * @example
 * { block: 'i-bem', elems: ['dom', 'html', 'i18n'] }
 * @param {String} jsContent
 * @param {String} bemhtmlContent
 * @returns {Object}
 */
function getExpectedDeps(jsContent, bemhtmlContent) {
    var expectedDeps = {};

    var isDecl = /BEM\.decl\(/.test(jsContent),
        isDom = /DOM\.decl\(/.test(jsContent),
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
}

/**
 * Checks the equality of the given actual and expected deps
 * @param {Object} actualDeps
 * @param {Object} expectedDeps
 * @returns {Boolean}
 */
function isEqual(actualDeps, expectedDeps) {
    if (actualDeps.block === expectedDeps.block) {
        return !_.xor(actualDeps.elems, expectedDeps.elems).length;
    }

    return false;
}

module.exports = {
    getActualDeps: getActualDeps,
    getExpectedDeps: getExpectedDeps,
    isEqual: isEqual
};
