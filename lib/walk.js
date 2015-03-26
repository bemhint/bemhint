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
        return config.getLevels().some(function (level) {
            return dir.match(level);
        });
    }

    /**
     * Returns levels to scan from the given targets
     * Scans the levels in the current directory if targets were not given
     * @param {String[]} targets
     * @returns {Promise * Array}
     */
    function getTargetLevels(targets) {
        /**
         * Returns the last target level
         * @param {String} target
         * @returns {String}
         */
        function _getLastTargetLevel(target) {
            return _(config.getLevels())
                .map(function (level) {
                    var matched = target.match(level);
                    if (matched) {
                        return matched[1];
                    }
                })
                .compact()
                .sortBy('length')
                .thru(function (levels) {
                    return levels.length ? [path.normalize(_.last(levels))] : [];
                })
                .value();
        }

        /**
         * Returns the level from the given target
         * @param {String} target
         * @returns {Promise * String[]}
         */
        function _getTargetLevel(target) {
            return vfs.listDir(target)
                .then(function (dirs) {
                    return _(dirs)
                        .filter(_filterByLevels)
                        .map(function (dir) {
                            return path.join(target, dir);
                        })
                        .thru(function (dirs) {
                            return dirs.length ? dirs : _getLastTargetLevel(target);
                        })
                        .value();
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
    function loadEntities(hash, targetLevels) {
        /**
         * Checks whether the given path is excluding
         * @param {String} path
         * @returns {Boolean}
         */
        function _isExcluding(path) {
            return config.getExcludeFiles().some(function (excludeFile) {
                return excludeFile.match(path);
            });
        }

        /**
         * Checks whether the given path is a target
         * @param {String} p
         * @returns {Boolean}
         */
        function _isTarget(p) {
            return targets.some(function (target) {
                var targetPath = path.join(path.dirname(target), path.basename(target));
                if (targetPath === '.') return true;

                return _.contains(p, targetPath);
            });
        }

        /**
         * @param {Object} data
         * @returns {Promise * Object}
         */
        function _walkStep(data) {
            return vfs.isDir(data.path)
                .then(function (isDir) {
                    if (!isDir) {
                        return vfs.read(data.path, 'utf-8')
                            .then(function (content) {
                                data.content = content;
                            });
                    }

                    return vfs.listDir(data.path)
                        .then(function (dirs) {
                            return _(dirs)
                                .filter(_filterByLevels)
                                .map(function (dir) {
                                    return path.join(data.path, dir);
                                })
                                .value();
                        })
                        .then(function (dirs) {
                            return loadEntities(hash, dirs);
                        });
                });
        }

        var walker = walk(targetLevels),
            promises = [],
            defer = vow.defer();

        /**
         * Walker's emitters
         * -----------------
         */
        walker.on('data', function (raw) {
            if (_isExcluding(raw.path) || !_isTarget(raw.path)) return;

            var stringifiedEntity = naming.stringify(raw.entity),
                data = {
                    name: [stringifiedEntity, raw.tech].join('.'),
                    tech: raw.tech,
                    path: raw.path
                },
                id = [raw.level, stringifiedEntity].join('/');

            hash[id] = hash[id] || {};
            hash[id][data.tech] = data;

            promises.push(_walkStep(data));
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

    return getTargetLevels(targets)
        .then(function (targetLevels) {
            return loadEntities({}, targetLevels);
        });
};
