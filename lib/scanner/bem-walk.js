var bemWalk = require('bem-walk'),
    q = require('q');

/**
 * @param {String[]} levels
 * @returns {Promise<Object[]>}
 */
exports.walk = function(levels) {
    var walker = bemWalk(levels),
        defer = q.defer(),
        techs = [];

    walker.on('data', function(data) {
        techs.push({
            entity: data.entity,
            level: data.level,
            name: data.tech,
            path: data.path
        });
    });

    walker.on('error', function(err) {
        defer.reject(err);
    });

    walker.on('end', function() {
        defer.resolve(techs);
    });

    return defer.promise;
};
