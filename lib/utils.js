/**
 * Utils
 * =====
 */

/**
 * Wraps something into an array
 * @param {*} smth
 * @returns {Object[]}
 */
function wrapIntoArray(smth) {
    return Array.isArray(smth) ? smth : [smth];
}

module.exports = {
    wrapIntoArray: wrapIntoArray
};
