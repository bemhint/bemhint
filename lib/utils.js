'use strict';

var _ = require('lodash'),
    fs = require('fs'),
    PATH = require('path'),
    minimatch = require('minimatch');

/**
 * Promisified version fs methods:
 *   - stat
 *   - readFile
 *   - readdir
 *
 * @type {Object}
 */
var pifiedFs = [{}, 'stat', 'readFile', 'readdir'].reduce((result, method) => {
    result[method] = Promise.promisify(fs[method]);

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
 * Returns list of files in path indicated by guard value:
 *  - true indicates that the entry should be included
 *  - false indicates that the file should be excluded, but should still be traversed if it is a directory
 *  - null indiciates that a directory should not be traversed
 *
 * @param {String} path
 * @param {GuardFunction} guard
 * @returns {Promise<String[]>}
 */
exports.listTree = function(path, guard) {
    return pifiedFs.stat(path).then((stats) => {
        const guardValue = guard(path, stats);
        const result = [];

        if(guardValue) {
            result.push(path);
        }

        if(stats.isDirectory() && guardValue !== null) {
            return pifiedFs.readdir(path)
                .then((files) => {
                    const listDeeper = (file) => this.listTree(PATH.join(path, file), guard);

                    return Promise.mapSeries(files, listDeeper);
                }).then((subResult) =>
                    _.flatten(result.concat(subResult))
                );
        }

        return result;
    });
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

/**
 * @callback GuardFunction
 * @param {String} path
 * @param {fs.Stats} stats
 * @returns {Boolean|null}
 */
