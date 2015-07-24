var path = require('path'),
    _ = require('lodash'),
    vow = require('vow'),
    CheckRunner = require('./check-runner'),
    Config = require('./config'),
    reporters = require('./reporters'),
    scanLevels = require('./scanner');

/**
 * @param {Object}   configOpts
 * @param {String[]} configOpts.levels – masks for redefinition levels
 * @param {String[]} configOpts.exludeFiles - masks for files to be ignored
 * @param {String[]} configOpts.techsWithLevels – techs which contain redefinition levels
 * @param {String[]} configOpts.rules – rules from the folder ./lib/rules/*.js
 * @param {String[]} configOpts.plugins – rules from `node_modules`
 * @param {String[]} configOpts.targets –  dirs to check
 * @param {String[]} configOpts.reporters – html or/and flat
 */
module.exports = function(configOpts) {
    var config = new Config(configOpts);

    return vow.all([
            scanLevels(config),
            loadRules(config.getChecks())
        ])
        .spread(function(entities, rules) {
            var checkRunner = new CheckRunner(entities);

            return _(rules)
                .map(checkRunner.check.bind(checkRunner))
                .flatten()
                .sortBy('path')
                .value();
        })
        .then(function(bemErrors) {
            config.reporters.forEach(function(reporter) {
                reporters.mk(reporter).write(bemErrors);
            });

            return bemErrors;
        });
};

/**
 * @param {Object}   checks
 * @param {String[]} checks.rules
 * @param {String[]} check.plugins
 * @returns {Function[]}
 */
function loadRules(checks) {
    var rulesDir = path.join(__dirname, 'rules');

    return _(checks.rules)
        .map(function(value, rule) {
            return path.join(rulesDir, rule);
        })
        .concat(checks.plugins)
        .map(require)
        .value();
}
