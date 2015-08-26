var path = require('path'),
    _ = require('lodash'),
    vow = require('vow'),
    vfs = require('vow-fs'),
    bemWalk = require('./bem-walk');

/**
 * @typedef {Object} WalkedTech
 * @property {String} entityId - a string in format <level>@<stringified_entity> (some.blocks@block__elem_modName)
 * @property {String} name
 * @property {String} path
 */

/**
 * @param {Config} config – see ./lib/config.js
 * @returns {Promise * Object}
 */
module.exports = function(config) {
    return getTargetsLevels(config)
        .then(_.partial(walk, _, config))
        .then(function(techs) {
            return _.filter(techs, function(tech) {
                return config.isTargetPath(tech.path) && !config.isExcludingPath(tech.path);
            });
        })
        .then(getTechsContent)
        .then(_.compact)
        .then(function(techs) {
            return _.groupBy(techs, 'entityId');
        });

    /**
     * @param {WalkedTech[]} techs
     * @returns {Object}
     */
    function getTechsContent(techs) {
        return vow.all(techs.map(function(tech) {
            return vfs.isDir(tech.path)
                .then(function(isDir) {
                    if(isDir) {
                        return;
                    }

                    return vfs.read(tech.path, 'utf-8')
                        .then(function(content) {
                            return _.extend(tech, {content: content});
                        });
                });
        }));
    }
};

/**
 * Recieves redefinition levels to scan from given targets
 * @param {Config} config – see ./lib/config.js
 * @returns {String[]}
 */
function getTargetsLevels(config) {
    return _(config.targets)
        .map(getTargetLevels_)
        .thru(vow.all)
        .value()
        .then(_.flatten);

    /**
     * @param {String} target
     * @returns {String[]}
     */
    function getTargetLevels_(target) {
        return getLevels(target, config)
            .then(function(levels) {
                if(!_.isEmpty(levels)) {
                    return levels;
                }

                var dirname = path.dirname(target);
                return dirname !== '.' ? getTargetLevels_(dirname) : [];
            });
    }
}

/**
 * @param {String[]} targetLevels
 * @param {Config} config – see ./lib/config.js
 * @returns {WalkedTech[]}
 */
function walk(targetLevels, config) {
    return bemWalk(targetLevels)
        .then(function(techs) {
            return vow.all(techs.map(function(tech) {
                if(!_.contains(config.techsWithLevels, tech.name)) {
                    return vow.resolve(tech);
                }

                return getLevels(tech.path, config)
                    .then(_.partial(walk, _, config));
            }));
        })
        .then(_.flatten);
}

/**
 * @param {String} path_
 * @param {Config} config – see ./lib/config.js
 * @returns {String[]}
 */
function getLevels(path_, config) {
    return vfs.listDir(path_)
        .then(function(dirs) {
            return _(dirs)
                .filter(config.isTargetLevel.bind(config))
                .map(function(dir) {
                    return path.join(path_, dir);
                })
                .value();
        });
}
