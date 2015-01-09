/**
 * The core of BEM hint
 * ====================
 */
var FileList = require('./file-list'),
    depsChecker = require('./deps-checker');

/**
 * Loads the file list and checks it
 * @param {Object} [config]
 * @param {Array}  [config.checkDirectories]
 * @returns {Promise * Array} - the list of BEM errors
 */
module.exports = function (config) {
    var checkDirs = config.checkDirectories,
        fileList = new FileList(checkDirs);

    return fileList.load()
        .then(function () {
            var files = fileList.getBySuffixes(['.js', '.bemhtml', '.deps.js']);

            return depsChecker.check(files);
        });
};
