var PATH = require('path'),
    _ = require('lodash'),
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
 * @param {String} value
 * @returns {String}
 *
 * @example
 * some.blocks/some-block/some-block.some.tech, another.tech –> some.blocks/some-block/some-block.another.tech
 */
exports.replaceTech = function(path, value) {
    return PATH.join(PATH.dirname(path), PATH.basename(path).split('.').shift()) + '.' + value;
};
