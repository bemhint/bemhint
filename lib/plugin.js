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
        this.config = config;

        this._module = require(path);
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
            forEntityTech = module.forEntityTech;

        forEntities && res.push(forEntities.call(this, entities));

        (forEntity || forEntityTech) && entities.forEach(function(entity) {
            forEntity && res.push(forEntity.call(this, entity, entities));

            var techs = this.config.techs;
            forEntityTech && techs && _.forEach(techs, function(techsConfig, techs) {
                techsConfig = utils.getConfig(techsConfig);

                techsConfig && techs.split('|').forEach(function(techName) {
                    var tech = entity.getTechByName(techName);

                    tech && res.push(forEntityTech.call(this, tech, techsConfig, entity, entities));
                });
            }, this);
        }, this);

        return q.all(res);
    }
});
