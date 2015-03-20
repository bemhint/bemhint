/**
 * The core of BEM hint
 * ====================
 */
var vow = require('vow'),
    _ = require('lodash'),
    scan = require('./walk'),
    loadRules = require('./load-rules'),
    Configuration = require('./configuration');

/**
 * Loads BEM entities and checks them
 * @param {String[]} targets
 * @param {Object} loadedConfig
 * @returns {Promise * Object[]} - the list of BEM errors
 */
module.exports = function (targets, loadedConfig) {
    var config = new Configuration(loadedConfig);

    return vow.all([scan(targets, config), loadRules()])
        .spread(function (entities, rules) {
            return vow.all(Object.keys(rules).map(function (rule) {
                return new rules[rule]().check(entities);
            }));
        })
        .then(function (res) {
            return _(res)
                .flatten()
                .sortByAll(['path'])
                .value();
        });
};
