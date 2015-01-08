var _ = require('lodash'),
    vow = require('vow'),
    vfs = require('vow-fs'),
    inherit = require('inherit');

module.exports = inherit({
    __constructor: function (dirs) {
        this._dirs = dirs || [];
        this._content = [];
    },

    getContent: function () {
        return this._content;
    },

    load: function () {
        var _this = this;

        return vow.all(_this._dirs.map(function (dir) {
            return _this._getDirectory(dir);
        }))
        .then(function (lists) {
            var fileList = [];

            lists.forEach(function (list) {
                fileList = fileList.concat(list);
            });

            this._content = fileList;
        }, this);
    },

    _getDirectory: function (dir) {
        var _this = this;

        return vfs.listDir(dir).then(function (filenames) {
            return vow.all(filenames.map(function (filename) {
                var fullpath = dir + '/' + filename;
                return vfs.isDir(fullpath).then(function (isDir) {
                    if (!isDir) {
                        return vfs.read(fullpath, 'utf-8').then(function (content) {
                            return {
                                name: filename,
                                fullpath: fullpath,
                                suffix: filename.substring(filename.indexOf('.')),
                                content: content
                            };
                        });
                    }

                    return _this._getDirectory(fullpath).then(function (content) {
                        return {
                            name: filename,
                            fullpath: fullpath,
                            children: content
                        };
                    });
                });
            }));
        });
    },

    getFilesBySuffixes: function (suffixes) {
        return this._getFiles(this._content, suffixes);
    },

    _getFiles: function (fileList, suffixes) {
        var _this = this,
            res = [],
            files = [];

        fileList.forEach(function (file) {
            if (!file.children) {
                if (suffixes.indexOf(file.suffix) > -1) {
                    files.push(file);
                }
            } else {
                res = res.concat(_this._getFiles(file.children, suffixes));
            }
        });

        var grouped = _.groupBy(files, function (elem) {
            return elem.name.substring(0, elem.name.lastIndexOf(elem.suffix));
        });

        _.keys(grouped).forEach(function (item) {
            res.push(grouped[item]);
        });

        return res;
    }
});
