var _ = require('lodash');

/**
 * @typedef {Object} ConfigFile
 * @property {String[]} levels
 * @property {String[]} excludePaths
 * @property {String[]} plugins
 */

/**
 * @param {Object} opts
 * @param {String} opts.configPath
 * @param {String[]} opts.reporters
 * @param {ConfigFile} opts.config
 */
module.exports = function(opts) {
    return _.defaultsDeep(opts || {}, {
        configPath: '.bemhint.js',
        reporters: ['flat'],
        config: {
            levels: [],
            excludePaths: [],
            plugins: []
        }
    });
};
