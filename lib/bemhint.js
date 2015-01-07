var vow = require('vow'),
    vfs = require('vow-fs'),
    FileList = require('./file-list'),
    DepsChecker = require('./deps-checker');

module.exports = function (config) {
    var checkDirs = config.checkDirectories,
        _fileList = new FileList(checkDirs);

    return _fileList.load()
        .then(function (fileList) {
            var depsChecker = new DepsChecker(fileList);

            return depsChecker.check();
        });
}
