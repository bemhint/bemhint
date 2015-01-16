var path = require('path'),
    vfs = require('vow-fs');

/**
 * Loads all checking rules from the directory 'lib/rules/'
 * @returns {Object}
 */
module.exports = function () {
    var rulesDir = path.join(__dirname, 'rules'),
        rules = {};

    return vfs.listDir(rulesDir)
        .then(function (list) {
            list.forEach(function (file) {
                if (path.extname(file) !== '.js') {
                    return;
                }

                rules[file] = require(path.join(rulesDir, file));
            });

            return rules;
        });
};
