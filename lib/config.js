var fs = require('fs'),
    PATH = require('path'),
    inherit = require('inherit'),
    _ = require('lodash'),
    q = require('q'),
    qfs = require('q-io/fs'),
    defaults = require('./defaults'),
    utils = require('./utils');

/**
 * @class
 * @name Config
 */
var Config = inherit({
    /**
     * @typedef {Object} ConfigFile
     * @property {String[]} levels
     * @property {String[]} excludePaths
     * @property {String[]} plugins
     */

    /**
     * @constructor
     * @param {String[]} targets
     * @param {Object} opts
     * @param {String} opts.configPath
     * @param {String[]} opts.reporters
     * @param {ConfigFile} opts.config
     */
    __constructor: function(targets, opts) {
        opts = defaults(opts);

        this._configPath = opts.configPath;

        this._targets = this._formatTargets(targets);
        this._levels = opts.config.levels;

        this._excludePaths = this._formatExcludedPaths(opts.config.excludePaths);

        this._plugins = opts.config.plugins;

        this.reporters = opts.reporters;
    },

    /**
     * @param {String[]} targets
     * @returns {String[]}
     * @private
     *
     * @example
     * /some.blocks/some-block/some-block.ext –> /some.block/some-block/some-block*
     * /some.blocks/some-block/__some-elem –> /some.blocks/some-block/__some-elem/**
     */
    _formatTargets: function(targets) {
        targets = targets || [];

        return _(targets)
            .map(formatTarget_)
            .uniq()
            .value();

        ///
        function formatTarget_(target) {
            return fs.statSync(target).isFile()
                ? PATH.join(PATH.dirname(target), PATH.basename(target).split('.').shift()) + '*'
                : PATH.join(target, '**');
        }
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
        return _(this._targets)
            .map(getLevelsFromTarget_.bind(this))
            .thru(q.all).value()
            .then(_.flatten)
            .then(_.compact);

        ///
        function getLevelsFromTarget_(target) {
            var lastLevelInTarget = this._getLastLevelInTarget(target);

            if(!utils.hasGlobstarEnding(target)) {
                return [lastLevelInTarget];
            }

            return this._getLevelsInTargetTree(target)
                .then(Array.prototype.concat.bind([lastLevelInTarget]));
        }
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
        return qfs.listDirectoryTree(PATH.dirname(target))
            .then(findLevels_.bind(this));

        ///
        function findLevels_(tree) {
            return _.filter(tree, function(path) {
                return !this.isExcludedPath(path) && this._isLevel(path);
            }, this);
        }
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
        return utils.someMinimatch(this._targets, path);
    },

    /**
     * @param {String} path
     * @returns {Boolean}
     * @public
     */
    isExcludedPath: function(path) {
        return utils.someMinimatch(this._excludePaths, path);
    },

    /**
     * @returns {Function[]}
     * @public
     */
    requirePlugins: function() {
        return _.map(this._plugins, function(path) {
            var pluginPath = utils.hasDotBeginning(path) ? this._resolvePath(path) : path;

            return utils.requirePlugin(pluginPath);
        }, this);
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
        return PATH.resolve(PATH.dirname(this._configPath), path);
    }
});

module.exports = Config;
