var _ = require('lodash'),
    q = require('q'),
    qfs = require('q-io/fs'),
    bemWalk = require('./bem-walk');

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
 * @property {String} name
 * @property {String} path
 * @property {String} [content]
 */

/**
 * @param {Config} config
 * @returns {Tech[]}
 */
exports.scan = function(config) {
    return config.getLevels()
        .then(bemWalk.walk)
        .then(filterTechs_)
        .then(loadTechsContent);

    ///
    function filterTechs_(techs) {
        return _.filter(techs, function(tech) {
            return config.isTargetPath(tech.path) && !config.isExcludedPath(tech.path);
        });
    }
};

/**
 * @param {Object[]} techs
 * @returns {Tech[]}
 */
function loadTechsContent(techs) {
    return q.all(techs.map(function(tech) {
        return qfs.stat(tech.path)
            .then(function(stat) {
                if(stat.isDirectory()) {
                    return tech;
                }

                return qfs.read(tech.path)
                    .then(function(content) {
                        return _.extend(tech, {content: content});
                    });
            });
    }));
}
