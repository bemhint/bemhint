'use strict';

var fs = require('fs'),
    PATH = require('path'),
    minimatch = require('minimatch');

/**
 * @param {String[]} masks
 * @param {String} path
 * @returns {Boolean}
 */
exports.someMinimatch = function(masks, path) {
    return masks.some(mask => minimatch(path, mask));
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
exports.listTree = (path, guard) => {
    return new Promise((resolve, reject) => {
        fs.stat(path, (fsError, stats) => {
            if(fsError) {
                reject(fsError);
                return;
            }

            const guardValue = guard(path, stats);
            const result = [];

            if(guardValue) {
                result.push(path);
            }

            if(stats.isDirectory() && guardValue !== null) {
                fs.readdir(path, (fsError, files) => {
                    if(fsError) {
                        reject(fsError);
                        return;
                    }

                    files
                        .reduce((before, file) => before.then(
                            leftResult => this.listTree(PATH.join(path, file), guard).then(
                                rightResult => leftResult.concat(rightResult)
                            )
                        ), Promise.resolve(result))
                        .then(resolve);
                });
            } else {
                resolve(result);
            }
        });
    });
};

/**
 * Returns contents of file if it is not a directory
 *
 * @param {String} path
 */
exports.readIfFile = path =>
    new Promise((resolve, reject) => {
        fs.stat(path, (fsError, stats) => {
            if(fsError) {
                reject(fsError);
                return;
            }

            if(stats.isDirectory()) {
                resolve();
                return;
            }

            fs.readFile(path, 'utf8', (fsError, content) => {
                fsError ? reject(fsError) : resolve(content);
            });
        });
    });

/**
 * @callback GuardFunction
 * @param {String} path
 * @param {fs.Stats} stats
 * @returns {Boolean|null}
 */
