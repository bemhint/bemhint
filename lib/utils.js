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

module.exports = {
    sortByFullpath: sortByFullpath
};
