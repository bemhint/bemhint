'use strict';

var bemWalk = require('@bem/walk');

/**
 * @param {String[]} levels
 * @returns {Promise<Object[]>}
 */
exports.walk = function(levels) {
    var walker = bemWalk(levels),
        techs = [];

    return new Promise((resolve, reject) => {
        walker.on('data', function(data) {
            techs.push({
                entity: data.cell.entity,
                level: data.cell.layer,
                name: data.cell.tech,
                path: data.path
            });
        });

        walker.on('error', reject);

        walker.on('end', () => {
            resolve(techs);
        });
    });
};
