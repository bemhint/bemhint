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
 * Recursively obtains the information about BEM entities
 * @param {Object} hash
 * @param {Array} levels
 * @returns {Promise * Object}
 */
function loadEntities(hash, levels) {
    var walker = walk(levels),
        promises = [],
        defer = vow.defer();

    walker.on('data', function (data) {
        var entity = {
            block: data.block,
            elem: data.elem,
            modName: data.modName,
            modVal: data.modVal
        };

        var str = naming.stringify(entity),
            _data = {
                name: str + '.' + data.tech,
                tech: data.tech,
                path: data.path
            },
            promise;

        if (data.tech === 'examples' || data.tech === 'test') {
            promise = vfs.listDir(data.path)
                .then(function (dirs) {
                    dirs = dirs
                        .filter(function (dir) {
                            return dir.indexOf('blocks') !== -1;
                        })
                        .map(function (dir) {
                            return path.join(data.path, dir);
                        });

                    return loadEntities(hash, dirs);
                });
        } else {
            promise = vfs.isFile(data.path)
                .then(function (isFile) {
                    if (isFile) {
                        return vfs.read(data.path, 'utf-8')
                            .then(function (str) {
                                _data.content = str;
                            });
                    }
                });
        }

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

/**
 * Asynchronously scans the given levels
 * @example
 * For more detail example see the tests --> test/unit/fixtures/expected-entities.js
 * @param {Array} levels
 * @return {Promise * Object}
 */
module.exports = function (levels) {
    var hash = {};

    return loadEntities(hash, levels);
};
