/**
 * Levels' scanner
 * ===============
 */
var path = require('path'),
    walk = require('bem-walk'),
    naming = require('bem-naming'),
    vow = require('vow'),
    vfs = require('vow-fs');

/**
 * Asynchronously scans the given levels
 * @example
 * For more detail example see the tests --> test/unit/fixtures/walk/entities-from-levels.js
 * @param {Array} targets
 * @param {Minimatch[]} excludeFiles
 * @return {Promise * Object}
 */
module.exports = function (targets, excludeFiles) {
    /**
     * Returns levels to scan from the given targets
     * Scans the levels in the current directory if targets were not given
     * @param {Array|undefined} targets
     * @returns {Promise * Array}
     */
    function _getLevels(targets) {
        targets = targets || ['.'];

        /**
         * Returns the level from the given target
         * @param {String} target
         * @returns {Promise * Array}
         */
        function _getLevel(target) {
            return vfs.listDir(target)
                .then(function (dirs) {
                    dirs = dirs.filter(function (dir) {
                        return dir.indexOf('blocks') > -1;
                    });

                    if (dirs.length) {
                        return dirs.map(function (dir) {
                            return path.join(target, dir);
                        });
                    }

                    if (target.lastIndexOf('blocks') > -1) {
                        return [target.substring(0, target.lastIndexOf('blocks') + 6)];
                    }

                    return [];
                });
        }

        return vow.all(targets.map(function (target) {
            return _getLevel(target);
        }))
        .then(function (groupsOfLevels) {
            var levels = [];

            groupsOfLevels.forEach(function (group) {
                levels = levels.concat(group);
            });

            return levels;
        });
    }

    /**
     * Recursively obtains the information about BEM entities
     * @param {Object} hash
     * @param {Array} levels
     * @returns {Promise * Object}
     */
    function _loadEntities(hash, levels) {
        var walker = walk(levels),
            promises = [],
            defer = vow.defer();

        /**
         * Checks whether the given path is excluding
         * @param {String} path
         * @returns {Boolean}
         */
        function _isExcluding(path) {
            for (var i = 0; i < excludeFiles.length; i++) {
                if (excludeFiles[i].match(path)) return true;
            }

            return false;
        }

        /**
         * Checks whether the given path is a target
         * @param {String} path
         * @returns {Boolean}
         */
        function _isTarget(path) {
            if (!targets) return true;

            for (var i = 0; i < targets.length; i++) {
                if (path.indexOf(targets[i]) > -1) return true;
            }

            return false;
        }

        walker.on('data', function (data) {
            if (_isExcluding(data.path) || !_isTarget(data.path)) return;

            var str = naming.stringify(data.entity),
                _data = {
                    name: str + '.' + data.tech,
                    tech: data.tech,
                    path: data.path
                };

            var promise = vfs.isDir(data.path)
                .then(function (isDir) {
                    if (isDir) {
                        return vfs.listDir(data.path)
                            .then(function (dirs) {
                                dirs = dirs.filter(function (dir) {
                                        return dir.indexOf('blocks') > -1;
                                    })
                                    .map(function (dir) {
                                        return path.join(data.path, dir);
                                    });

                                return _loadEntities(hash, dirs);
                            });
                    } else {
                        return vfs.read(data.path, 'utf-8')
                            .then(function (str) {
                                _data.content = str;
                            });
                    }
                });

            promises.push(promise);

            var id = data.level + '/' + str;
            hash[id] = (hash[id] || []).concat(_data);
        });

        walker.on('error', function (err) {
            defer.reject(err);
        });

        walker.on('end', function () {
            vow.all(promises)
                .then(function () {
                    defer.resolve(hash);
                })
                .fail(function (err) {
                    defer.reject(err);
                });
        });

        return defer.promise();
    }

    return _getLevels(targets)
        .then(function (levels) {
            return _loadEntities({}, levels);
        });
};
