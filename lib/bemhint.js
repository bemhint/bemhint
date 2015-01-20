/**
 * The core of BEM hint
 * ====================
 */
var vow = require('vow'),
    _ = require('lodash'),
    scan = require('./walk'),
    loadRules = require('./load-rules'),
    Configuration = require('./configuration'),
    utils = require('./utils');

/**
 * Loads BEM entities and checks them
 * @param {Object} loadedConfig
 * @param {Array} targets
 * @returns {Promise * Array} - the list of BEM errors
 */
module.exports = function (loadedConfig, targets) {
    var config = new Configuration(loadedConfig);

    return vow.all([scan(targets, config), loadRules()])
        .spread(function (entities, rules) {
            return vow.all(_.keys(rules).map(function (rule) {
                var _rule = new rules[rule](config);

                return _rule.check(entities);
            }));
        })
        .then(function (res) {
            var bemErros = [];

            _(res).keys().forEach(function (item) {
                bemErros = bemErros.concat(res[item]);
            });

            return utils.sortByFullpath(bemErros);
        });
};
