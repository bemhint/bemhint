var _ = require('lodash');

/**
 * @param {Object} opts
 * @param {String} opts.basedir
 * @param {String[]} opts.reporters
 * @param {String[]} opts.levels
 * @param {String[]} opts.excludePaths
 * @param {Object} opts.plugins
 * @returns {Object}
 */
module.exports = function(opts) {
    return _.defaults(opts || {}, {
        basedir: process.cwd(),
        reporters: ['flat'],
        levels: [],
        excludePaths: [],
        plugins: {}
    });
};
