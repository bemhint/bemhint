/**
 * Utils
 * =====
 */

/**
 * Filters the given entities by the given techs
 * @param {Object} entities
 * @param {Array} techs
 * @returns {Object}
 */
function filterByTechs(entities, techs) {
    var filtered = {};

    Object.keys(entities).forEach(function (item) {
        filtered[item] = [];

        entities[item].forEach(function (file) {
            if (techs.indexOf(file.tech) > -1) {
                filtered[item].push(file);
            }
        });

        !filtered[item].length && delete filtered[item];
    });

    return filtered;
}

module.exports = {
    filterByTechs: filterByTechs
};
