var _ = require('lodash'),
    minimatch = require('minimatch');

/**
 * @param {String[]} masks
 * @param {String} path
 * @returns {Boolean}
 */
exports.someMinimatch = function(masks, path) {
    return _.some(masks, function(mask) {
        return minimatch(path, mask);
    });
};

/**
 * @param {String} path
 * @returns {Boolean}
 */
exports.hasGlobstarEnding = function(path) {
    return /\*\*$/.test(path);
};

/**
 * @param {String} path
 * @returns {Boolean}
 */
exports.hasDotBeginning = function(path) {
    return /^\./.test(path);
};
