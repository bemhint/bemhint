'use strict';

var utils = require('../utils'),
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
        return techs.filter((tech) => config.isTargetPath(tech.path) && !config.isExcludedPath(tech.path));
    }
};

/**
 * @param {Object[]} techs
 * @returns {Promise<Tech[]>}
 */
function loadTechsContent(techs) {
    return techs.reduce((before, tech) => before.then(
        (leftResult) => utils.readIfFile(tech.path).then(
            (content) => leftResult.concat(
                typeof content === 'undefined' ? tech : Object.assign(tech, {content})
            )
        )
    ), Promise.resolve([]));
}
