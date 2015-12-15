var inherit = require('inherit'),
    _ = require('lodash'),
    q = require('q'),
    utils = require('./utils');

/**
 * @class
 * @name Plugin
 */
module.exports = inherit({
    /**
     * @constructor
     * @param {String} path
     * @param {Object} config
     */
    __constructor: function(path, config) {
        this._path = path;
        this._module = require(path);

        this.config = config;
        this._normalizeTechsConfigs();
    },

    /**
     * @param {Entity[]} entities
     * @public
     */
    run: function(entities) {
        var res = [],
            module = this._module,
            forEntities = module.forEntities,
            forEntity = module.forEntity,
            forEntityTech = module.forEntityTech,
            techsConfigs = this._techsConfigs;

        forEntities && res.push(forEntities.call(this, entities));

        (forEntity || forEntityTech) && entities.forEach(function(entity) {
            forEntity && res.push(forEntity.call(this, entity, entities));

            forEntityTech && _.forEach(entity.getTechs(), function(tech) {
                var techConfig = techsConfigs[tech.name],
                    starTechConfig = techsConfigs['*'];

                if(techConfig === false || typeof techConfig === 'undefined' && !starTechConfig) {
                    return;
                }

                res.push(forEntityTech.call(this, tech, techConfig || starTechConfig, entity, entities));
            }, this);
        }, this);

        return q.all(res);
    },

    _normalizeTechsConfigs: function() {
        var configure = this._module.configure,
            config =  configure && configure() || this.config,
            techsConfigs = config.techs || {'*': {}},
            merged = this._techsConfigs = {};

        _.forEach(techsConfigs, function(config, techsNames) {
           config = techsConfigs[techsNames] = utils.getConfig(config, this._path);

            techsNames.split('|').forEach(function(techName) {
                var mergedConfig = merged[techName];

                merged[techName] = mergedConfig !== false && config ?  _.merge(config, mergedConfig) : false;
            });
        }, this);

        var star = techsConfigs['*'];

        if(star || star === false) {
            _.forEach(merged, function(config, techName) {
                config && (merged[techName] = _.merge(star || {}, config));
            });
        } else {
            merged['*'] = false;
        }
    }
});
