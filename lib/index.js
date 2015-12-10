var path = require('path'),
    bemNaming = require('bem-naming'),
    _ = require('lodash'),
    q = require('q'),
    Config = require('./config'),
    PluginsRunner = require('./plugins-runner'),
    reporters = require('./reporters'),
    scanner = require('./scanner');

/**
 * @typedef {Object} Notation
 * @property {String} block
 * @property {String} [elem]
 * @property {String} [modName]
 * @property {String} [modVal]
 */

/**
 * @typedef {Object} Tech
 * @property {Notation} entity
 * @property {String} level
 * @property {String} tech
 * @property {String} path
 * @property {String} [content]
 */

/**
 * @typedef {Tech[]} Techs
 */

/**
 * @typedef {Object} Error
 * @property {String} path
 * @property {String} msg
 * @property {Object|String} [value]
 */

/**
 * @param {String[]} targets
 * @param {Object} opts
 * @param {String} opts.configPath
 * @param {String[]} opts.reporters
 * @param {Object} opts.config
 * @returns {Promise<Error[]>}
 */
module.exports = function(targets, opts) {
    var config = new Config(targets, opts);

    return q(config)
        .then(scanner.scan)
        .then(groupTechsByEntities)
        .then(runPlugins_)
        .then(function(errors) {
            mkReports_(errors);

            return errors;
        });

    ///
    function runPlugins_(entities) {
        var pluginsRunner = new PluginsRunner(entities);

        return _(config.requirePlugins())
            .map(pluginsRunner.runPlugin.bind(pluginsRunner))
            .thru(q.all).value()
            .then(pluginsRunner.getErrors.bind(pluginsRunner))
            .then(function(errors) {
                return _.sortBy(errors, 'path');
            });
    }

    ///
    function mkReports_(errors) {
        _.forEach(config.reporters, function(reporter) {
            reporters.mk(reporter).write(errors);
        });
    }
};

/**
 * @param {Tech[]} techs
 * @returns {Techs[]}
 */
function groupTechsByEntities(techs) {
    return _(techs)
        .groupBy(function(item) {
            return item.level && item.entity && path.join(item.level, bemNaming.stringify(item.entity));
        })
        .map(_.identity)
        .value();
}
