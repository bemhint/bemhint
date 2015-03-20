/**
 * Levels' scanner
 * ===============
 */
var path = require('path'),
    _ = require('lodash'),
    walk = require('bem-walk'),
    naming = require('bem-naming'),
    vow = require('vow'),
    vfs = require('vow-fs');

/**
 * Asynchronously scans the given targets
 * @example
 * For more detail example see the tests --> test/unit/fixtures/walk/all-entities.js
 * @param {String[]} targets
 * @param {Object} config
 * @returns {Promise * Object}
 */
module.exports = function (targets, config) {
    /**
     * Helping filter function
     * @param {String} dir
     * @returns {Boolean}
     */
    function _filterByLevels(dir) {
        var levels = config.getLevels();

        return levels.some(function (level) {
            return dir.match(level);
        });
    }

    /**
     * Returns levels to scan from the given targets
     * Scans the levels in the current directory if targets were not given
     * @param {String[]} targets
     * @returns {Promise * Array}
     */
    function _getTargetLevels(targets) {
        /**
         * Returns the last target level
         * @param {String} target
         * @returns {String}
         */
        function _getLastTargetLevel(target) {
            var levels = config.getLevels(),
                lastTarget = '';

            levels.forEach(function (level) {
                var matched = target.match(level);
                if (!matched) return;

                var lastMatched = _.last(matched);
                lastTarget = lastMatched.length > lastTarget.length ? lastMatched : lastTarget;
            });

            return lastTarget.replace(/\/$/, '');
        }

        /**
         * Returns the level from the given target
         * @param {String} target
         * @returns {Promise * String[]}
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

                    return lastTargetLevel.length ? [lastTargetLevel] : [];
                });
        }

        return vow.all(targets.map(_getTargetLevel))
            .then(_.flatten);
    }

    /**
     * Recursively obtains the information about BEM entities
     * @param {Object} hash
     * @param {String[]} targetLevels
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

            return excludeFiles.some(function (excludeFile) {
                return excludeFile.match(path);
            });
        }

        /**
         * Checks whether the given path is a target
         * @param {String} path
         * @returns {Boolean}
         */
        function _isTarget(path) {
            return targets.some(function (target) {
                return _.contains(path, target);
            });
        }

        /**
         * Walker's emitters
         * -----------------
         */
        walker.on('data', function (raw) {
            if (_isExcluding(raw.path) || !_isTarget(raw.path)) return;

            var stringifiedEntity = naming.stringify(raw.entity),
                data = {
                    name: stringifiedEntity + '.' + raw.tech,
                    tech: raw.tech,
                    path: raw.path
                };

            var promise = vfs.isDir(data.path)
                .then(function (isDir) {
                    if (!isDir) {
                        return vfs.read(data.path, 'utf-8')
                            .then(function (str) {
                                data.content = str;
                            });
                    }

                    return vfs.listDir(data.path)
                        .then(function (dirs) {
                            dirs = dirs.filter(_filterByLevels)
                                .map(function (dir) {
                                    return path.join(data.path, dir);
                                });

                            return _loadEntities(hash, dirs);
                        });
                });

            promises.push(promise);

            var id = raw.level + '/' + stringifiedEntity;
            hash[id] = hash[id] || {};
            hash[id][data.tech] = data;
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
