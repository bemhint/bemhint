'use strict';

var fs = require('fs'),
    PATH = require('path'),
    bluebird = require('bluebird'),
    minimatch = require('minimatch'),
    _ = require('lodash');

/**
 * Promisified version fs methods:
 *   - stat
 *   - readFile
 *
 * @type {Object}
 */
var pifiedFs = [{}, 'stat', 'readFile'].reduce((result, method) => {
    result[method] = bluebird.promisify(fs[method]);

    return result;
});

/**
 * @param {String[]} masks
 * @param {String} path
 * @returns {Boolean}
 */
exports.someMinimatch = function(masks, path) {
    return masks.some((mask) => minimatch(path, mask));
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

/**
 * Returns contents of file if it is not a directory
 *
 * @param {String} path
 */
exports.readIfFile = function(path) {
    return pifiedFs.stat(path).then((stats) => {
        if(stats.isDirectory()) {
            return;
        }

        return pifiedFs.readFile(path, 'utf8');
    });
};

exports.hasErrors = (defects) => _.find(defects, {type: 'error'});

/**
 * @callback GuardFunction
 * @param {String} path
 * @param {fs.Stats} stats
 * @returns {Boolean|null}
 */
