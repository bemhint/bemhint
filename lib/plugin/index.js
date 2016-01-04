var inherit = require('inherit'),
    q = require('q'),
    PluginConfig = require('./config');

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
        this._module = require(path);

        this._config = new PluginConfig(path, config, this._module.configure);
    },

    /**
     * @param {Entity[]} entities
     * @returns {Promise<undefined>}
     * @public
     */
    run: function(entities) {
        var promises = [],
            config = this._config,
            module = this._module;

        module.forEntities && promises.push(module.forEntities(entities, config));

        (module.forEachEntity || module.forEachTech) && entities.forEach(function(entity) {
            var techs = entity.getTechs();

            module.forEachEntity && !config.isExcludedPath(techs[0].path)
                && promises.push(module.forEachEntity(entity, config));

            module.forEachTech && techs.forEach(function(tech) {
                config.getTechConfig(tech.name) && !config.isExcludedPath(tech.path)
                    && promises.push(module.forEachTech(tech, entity, config));
            });
        });

        return q.all(promises);
    }
});
