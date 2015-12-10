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
        techs.push(data);
    });

    walker.on('error', function(err) {
        defer.reject(err);
    });

    walker.on('end', function() {
        defer.resolve(techs);
    });

    return defer.promise;
};
