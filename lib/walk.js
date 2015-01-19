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
 * Asynchronously scans the given targets
 * @example
 * For more detail example see the tests --> test/unit/fixtures/walk/entities-from-levels.js
 * @param {Array} targets
 * @param {Object} config
 * @return {Promise * Object}
 */
module.exports = function (targets, config) {
    /**
     * Helping filter function
     * @param {String} dir
     * @return {Boolean}
     */
    function _filterByLevels(dir) {
        var levels = config.getLevels();

        for (var i = 0; i < levels.length; i++) {
            if (dir.match(levels[i])) return true;
        }

        return false;
    }

    /**
     * Returns levels to scan from the given targets
     * Scans the levels in the current directory if targets were not given
     * @param {Array|undefined} targets
     * @returns {Promise * Array}
     */
    function _getTargetLevels(targets) {
        targets = targets || ['.'];

        /**
         * Returns the last target level
         * @param {String} target
         * @returns {Object}
         */
        function _getLastTargetLevel(target) {
            var levels = config.getLevels(),
                lastTarget = '';

            for (var i = 0; i < levels.length; i++) {
                var matched = target.match(levels[i]);
                if (!matched) continue;

                var lastMatched = matched[matched.length - 1];

                lastTarget = lastMatched.length > lastTarget.length ? lastMatched : lastTarget;
            }

            return lastTarget.replace(/\/$/, '');
        }

        /**
         * Returns the level from the given target
         * @param {String} target
         * @returns {Promise * Array}
         */
        function _getTargetLevel(target) {
            return vfs.listDir(target)
                .then(function (dirs) {
                    dirs = dirs.filter(_filterByLevels);

                    if (dirs.length) {
                        return dirs.map(function (dir) {
                            return path.join(target, dir);
                        });
                    }

                    var lastTargetLevel = _getLastTargetLevel(target);

                    if (lastTargetLevel.length) {
                        return [lastTargetLevel];
                    }

                    return [];
                });
        }

        return vow.all(targets.map(function (target) {
            return _getTargetLevel(target);
        }))
        .then(function (groupsOfLevels) {
            var targetLevels = [];

            groupsOfLevels.forEach(function (group) {
                targetLevels = targetLevels.concat(group);
            });

            return targetLevels;
        });
    }

    /**
     * Recursively obtains the information about BEM entities
     * @param {Object} hash
     * @param {Array} targetLevels
     * @returns {Promise * Object}
     */
    function _loadEntities(hash, targetLevels) {
        var walker = walk(targetLevels),
            promises = [],
            defer = vow.defer();

        /**
         * Checks whether the given path is excluding
         * @param {String} path
         * @returns {Boolean}
         */
        function _isExcluding(path) {
            var excludeFiles = config.getExcludeFiles();

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
            for (var i = 0; i < targets.length; i++) {
                if (path.indexOf(targets[i]) > -1) return true;
            }

            return false;
        }

        /**
         * Walker's emitters
         * -----------------
         */
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
                                dirs = dirs.filter(_filterByLevels)
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
        /**
         * End of walker's emitters
         * ------------------------
         */

        return defer.promise();
    }

    return _getTargetLevels(targets)
        .then(function (targetLevels) {
            return _loadEntities({}, targetLevels);
        });
};
