var inherit = require('inherit'),
    _ = require('lodash'),
    thr = require('throw');

/**
 * @class
 * @name PluginConfig
 */
module.exports = inherit({
    /**
     * @constructor
     * @param {String} path
     * @param {Object|Boolean} config
     * @param {Function} [configure]
     */
    __constructor: function(path, config, configure) {
        this._path = path;

        this._config = this._parse(configure && configure() || config);

        this._normalizeTechsConfigs();
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
     * @param {Object|Boolean} config
     * @private
     */
    _parse: function(config) {
        if(config === false) {
            return false;
        }

        return config === true && {}
            || typeof config === 'object' && config
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
    }
});
