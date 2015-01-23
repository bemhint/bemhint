/**
 * Utils
 * =====
 */

/**
 * Sorts the given array of objects by property 'fullpath' in alphabetical order
 * @param {Array} arr
 * @returns {Array}
 */
function sortByFullpath(arr) {
    return arr.sort(function (a, b) {
        if (a.fullpath > b.fullpath) {
            return 1;
        }

        return -1;
    });
}

/**
 * Returns files from the given entity by the given techs
 * @param {Array} entity
 * @param {Array} techs
 * @returns {Object}
 */
function getFilesByTechs(entity, techs) {
    var files = {};

    entity.forEach(function (file) {
        if (techs.indexOf(file.tech) > -1) {
            files[file.tech] = file;
        }
    });

    return files;
}

module.exports = {
    sortByFullpath: sortByFullpath,
    getFilesByTechs: getFilesByTechs
};
