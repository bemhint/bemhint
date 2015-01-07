var vow = require('vow'),
    vfs = require('vow-fs');

var FileList = function (dirs) {
    this._dirs = dirs || [];
}

FileList.prototype.load = function () {
    var dirs = this._dirs;

    return vow.all(dirs.map(function (dir) {
            return _getDirectory(dir);
        }))
        .then(function (lists) {
            var fileList = [];

            lists.forEach(function (list) {
                fileList = fileList.concat(list);
            });

            return fileList;
        });
};

function _getDirectory(dir) {
    return vfs.listDir(dir)
        .then(function (filenames) {
            return vow.all(filenames.map(function (filename) {
                var fullpath = dir + '/' + filename;
                return vfs.isDir(fullpath)
                    .then(function (isDir) {
                        if (!isDir) {
                            return vfs.read(fullpath, 'utf-8')
                                .then(function (content) {
                                    return {
                                        name: filename,
                                        fullpath: fullpath,
                                        suffix: _getFileSuffix(filename),
                                        content: content
                                    }
                                });
                        }

                        return _getDirectory(fullpath)
                            .then(function (content) {
                                return {
                                    name: filename,
                                    fullpath: fullpath,
                                    children: content
                                };
                            });
                    });
            }));
        });
}

function _getFileSuffix(filename) {
    return filename.substring(filename.indexOf('.'));
}

module.exports = FileList;
