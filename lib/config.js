'use strict';

var fs = require('fs'),
    PATH = require('path'),
    bluebird = require('bluebird'),
    klaw = require('klaw'),
    inherit = require('inherit'),
    _ = require('lodash'),
    resolve = require('resolve'),
    defaults = require('./defaults'),
    Plugin = require('./plugin'),
    utils = require('./utils');

/**
 * @class
 * @name Config
 */
module.exports = inherit({
    /**
     * @constructor
     * @param {String[]} targets
     * @param {Object} opts
     * @param {String} opts.basedir
     * @param {String[]} opts.reporters
     * @param {String[]} opts.levels
     * @param {String[]} opts.excludePaths,
     * @param {Object} opts.plugins
     */
    __constructor: function(targets, opts) {
        opts = defaults(opts);

        this._basedir = PATH.resolve(opts.basedir);

        this._targets = this._prepareTargets(targets);
        this._formattedTargets = this._formatTargets(this._targets);
        this._levels = opts.levels;

        this._excludePaths = this._formatExcludedPaths(opts.excludePaths);

        this._plugins = opts.plugins;

        this.reporters = opts.reporters;
    },

    /**
     * @param {String[]} targets
     * @returns {Object[]}
     */
    _prepareTargets(targets) {
        return _(targets || [])
            .uniq()
            .map((target) => ({path: target, isFile: fs.statSync(target).isFile()}))
            .value();
    },

    /**
     * @param {Object[]} targets
     * @returns {String[]}
     * @private
     *
     * @example
     * {isFile: true, path: /some.blocks/some-block/some-block.ext} –> /some.block/some-block/some-block.*
     * {isFile: false, path: /some.blocks/some-block/__some-elem} –> /some.blocks/some-block/__some-elem/**
     */
    _formatTargets: function(targets) {
        return (targets || []).map((target) => {
            return target.isFile ? utils.replaceTech(target.path, '*') : PATH.join(target.path, '**');
        });
    },

    /**
     * @param {String[]} excludePaths
     * @returns {String[]}
     * @private
     */
    _formatExcludedPaths: function(excludePaths) {
        return _.map(excludePaths, this._resolvePath, this);
    },

    /**
     * @returns {Promise<String[]>}
     * @public
     */
    getLevels: function() {
        return bluebird.map(this._formattedTargets, (target) => {
                var lastLevelInTarget = this._getLastLevelInTarget(target);

                // if target is file mask
                if(!utils.hasGlobstarEnding(target)) {
                    return [lastLevelInTarget];
                }

                // if target is dir mask
                return this._getLevelsInTargetTree(target)
                    .then((levels) => [lastLevelInTarget].concat(levels));
            })
            .then((levels) => _(levels).flatten().compact().uniq().value());
    },

    /**
     * @param {String} target
     * @returns {String|undefined}
     * @private
     *
     * @example
     * /some.blocks/block –> /some.blocks
     * /some.blocks/block/block.examples/blocks/example –> /some.blocks/block/block.examples/blocks
     */
    _getLastLevelInTarget: function(target) {
        var splitted = target.split(PATH.sep),
            lastLevelIndex = _.findLastIndex(splitted, this._isLevel.bind(this));

        if(lastLevelIndex === -1) {
            return;
        }

        var lastLevel = _.take(splitted, ++lastLevelIndex).join(PATH.sep);
        return !this.isExcludedPath(lastLevel) && lastLevel;
    },

    /**
     * @param {String} target
     * @returns {Promise<String[]>}
     * @private
     */
    _getLevelsInTargetTree: function(target) {
        return new Promise((resolve, reject) => {
            var result = [],
                targetDir = PATH.dirname(target);

            if(this.isExcludedPath(targetDir)) {
                resolve(result);
                return;
            }

            klaw(targetDir, {filter: itemPath => !this.isExcludedPath(itemPath)})
                .on('data', (item) => {
                    item.stats.isDirectory() && this._isLevel(item.path) && result.push(item.path);
                })
                .on('error', reject)
                .on('end', () => {
                    resolve(result);
                });
        });
    },

    /**
     * @param {String} path
     * @returns {Boolean}
     * @private
     */
    _isLevel: function(path) {
        return utils.someMinimatch(this._levels, PATH.basename(path));
    },

    /**
     * @param {String} path
     * @returns {Boolean}
     * @public
     */
    isTargetPath: function(path) {
        return utils.someMinimatch(this._formattedTargets, path);
    },

    /**
     * @param {String} path
     * @returns {Boolean}
     * @public
     */
    isExcludedPath: function(path) {
        return utils.someMinimatch(this._excludePaths, PATH.resolve(path));
    },

    /**
     * @returns {Function[]}
     * @public
     */
    requirePlugins: function() {
        return _(this._plugins)
            .map(function(config, path) {
                path = resolve.sync(path, {basedir: this._basedir});

                return [].concat(config).map(function(userConfig) {
                    return userConfig && new Plugin(path, {
                        userConfig: userConfig,
                        baseConfig: {configDir: this._basedir, targets: this._targets}
                    });
                }, this);
            }, this)
            .flatten()
            .compact()
            .value();
    },

    /**
     * @param {String} path
     * @returns {String}
     * @private
     *
     * @example
     * /config/path/.bemhint, /some/path.ext –> /config/path/some/path.ext
     */
    _resolvePath: function(path) {
        return PATH.resolve(this._basedir, path);
    }
});
