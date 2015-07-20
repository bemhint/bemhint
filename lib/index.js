var Config = require('./config'),
    scanLevels = require('./scanner'),
    CheckRunner = require('./check-runner'),
    path = require('path'),
    _ = require('lodash'),
    vow = require('vow'),
    reporters = require('./reporters');

/**
 *
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
 *
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
