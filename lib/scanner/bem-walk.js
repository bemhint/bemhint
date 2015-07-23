var walk = require('bem-walk'),
    naming = require('bem-naming'),
    vow = require('vow');

module.exports = function(targets) {
    var walker = walk(targets),
        defer = vow.defer(),
        result = [];

    walker.on('data', function(data) {
        result.push({
            entityId: data.level + '@' + naming.stringify(data.entity),
            name: data.tech,
            path: data.path
        });
    });

    walker.on('error', function(error) {
        defer.reject(error);
    });

    walker.on('end', function() {
        defer.resolve(result);
    });

    return defer.promise();
};
