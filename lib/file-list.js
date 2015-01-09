/**
 * FileList
 * ========
 */
var _ = require('lodash'),
    vow = require('vow'),
    vfs = require('vow-fs'),
    inherit = require('inherit');

/**
 * FileList
 * The class for interaction with the file system
 * @name FileList
 * @class
 */
module.exports = inherit({
    /**
     * Constructor
     * @param {Array} dirs
     */
    __constructor: function (dirs) {
        this._dirs = dirs || [];
        this._content = [];
    },

    /**
     * Asynchronously loads the information about the file system
     * @example
     * {
     *     name: <name of the file/folder>,
     *     fullpath: <fullpath to the file/folder>
     *     suffix: <file's suffix>
     *     content: <files's content>
     *     children: <folder's content>
     * }
     * For more detail example see the tests --> test/unit/fixtures/expected-list.js
     * @returns {Promise}
     * @public
     */
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

    /**
     * Recursively obtains the information about the folder
     * @param {String} dir
     * @returns {Array}
     * @private
     */
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

    /**
     * Returns the content of the loaded file list
     * returns {Array}
     * @public
     */
    getContent: function () {
        return this._content;
    },

    /**
     * Gets files by suffixes
     * @param {Array} suffixes
     * @returns {Array}
     * @public
     */
    getBySuffixes: function (suffixes) {
        return this._getBySuffixes(this._content, suffixes);
    },

    /**
     * Recursively gets the flat list of files grouped by the prefixes and the given suffixes
     * @example
     * For detail example see the tests --> test/unit/fixtures/expected-suffixes.js
     * @param {Array} fileList
     * @param {Array} suffixes
     * @returns {Array}
     * @private
     */
    _getBySuffixes: function (fileList, suffixes) {
        var _this = this,
            res = [],
            files = [];

        fileList.forEach(function (file) {
            if (!file.children) {
                if (suffixes.indexOf(file.suffix) > -1) {
                    files.push(file);
                }
            } else {
                res = res.concat(_this._getBySuffixes(file.children, suffixes));
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
