var PATH = require('path'),
    inherit = require('inherit'),
    _ = require('lodash'),
    thr = require('throw'),
    utils = require('../utils');

/**
 * @class
 * @name PluginConfig
 */
module.exports = inherit({
    /**
     * @constructor
     * @param {String} path
     * @param {Object} options
     * @param {Object} options.baseConfig
     * @param {Object|Boolean} options.userConfig
     * @param {Object|Boolean|undefined} [options.predefinedConfig]
     */
    __constructor: function(path, options) {
        this._path = path;
        this._baseConfig = options.baseConfig || {};

        this._targets = this._formatTargets(this._baseConfig.targets);

        this._config = options.userConfig && _.merge(
            {},
            this._parse(options.predefinedConfig),
            this._parse(options.userConfig)
        );

        this._normalizeTechsConfigs();
    },

    /**
     * @param {Object[]} targets
     * @returns {String[]}
     * @private
     */
    _formatTargets: function(targets) {
        return (targets || []).map((target) => target.isFile ? target.path : PATH.join(target.path, '**'));
    },

    /**
     * @private
     */
    _normalizeTechsConfigs: function() {
        var techsConfigs = this._config.techs || {'*': {}};

        this._config.techs = _.reduce(techsConfigs, function(result, config, techsNames) {
            config = this._parse(config);

            techsNames.split('|').forEach(function(techName) {
                var mergedConfig = result[techName];

                result[techName] = config && mergedConfig !== false ? _.merge(config, mergedConfig) : false;
            });

            return result;
        }, {}, this);
    },

    /**
     * @param {Object|Boolean|undefined} config
     * @private
     */
    _parse: function(config) {
        if(config === false || _.isUndefined(config)) {
            return false;
        }

        return config === true && {}
            || _.isObject(config) && config
            || thr('Invalid config for plugin ' + this._path);
    },

    /**
     * @param {String} techName
     * @returns {Object|Boolean}
     * @public
     */
    getTechConfig: function(techName) {
        var config = this._config.techs[techName],
            star = this._config.techs['*'];

        if(config === false) {
            return false;
        }

        return star && _.merge(star, config) || config || false;
    },

    /**
     * @returns {Object}
     * @public
     */
    getConfig: function() {
        return this._config;
    },

    /**
     * @returns {Boolean}
     * @public
     */
    isTargetTech: function(path) {
        return utils.someMinimatch(this._targets, path);
    },

    /**
     * @returns {String[]}
     * @public
     */
    isExcludedPath: function(path) {
        return utils.someMinimatch(this._config.excludePaths || [], path);
    },

    /**
     * @param {String} path
     * @returns {String}
     * @public
     */
    resolvePath: function(path) {
        return PATH.resolve(this._baseConfig.configDir, path);
    }
});
