var FileList = require('./file-list'),
    depsChecker = require('./deps-checker');

module.exports = function (config) {
    var checkDirs = config.checkDirectories,
        fileList = new FileList(checkDirs);

    return fileList.load()
        .then(function () {
            var files = fileList.getFilesBySuffixes(['.js', '.bemhtml', '.deps.js']);

            return depsChecker.check(files);
        });
};
